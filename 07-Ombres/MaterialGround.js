// Définition de la classe MaterialGround

Requires("Material");
Requires("Texture2D");


class MaterialGround extends Material
{
    /** constructeur */
    constructor()
    {
        let srcVertexShader = dedent
            `#version 100

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            uniform mat3 matN;

            // informations des sommets (VBO)
            attribute vec3 glVertex;
            attribute vec3 glNormal;
            attribute vec2 glTexCoords;

            // calculs allant vers le fragment shader
            varying vec3 frgN;              // normale du fragment en coordonnées caméra
            varying vec4 frgPosition;       // position du fragment en coordonnées caméra
            varying vec2 frgTexCoords;      // coordonnées de texture

            void main()
            {
                frgPosition = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * frgPosition;
                frgN = matN * glNormal;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 100
            precision mediump float;

            // caractéristiques du matériau
            uniform sampler2D texDiffuse;
            const vec3 Ks = vec3(0.7, 0.7, 0.7);
            const float ns = 64.0;

            // paramètres du shader : caractéristiques de la lampe
            uniform vec3 LightColor;        // couleur de la lampe
            uniform vec4 LightPosition;     // position ou direction d'une lampe positionnelle ou directionnelle
            uniform vec4 LightDirection;    // direction du cône pour une lampe spot
            uniform float cosmaxangle;
            uniform float cosminangle;

            // informations venant du vertex shader
            varying vec3 frgN;              // normale du fragment en coordonnées caméra
            varying vec4 frgPosition;       // position du fragment en coordonnées caméra
            varying vec2 frgTexCoords;      // coordonnées de texture

            // calcul des ombres
            uniform sampler2D ShadowMap;
            uniform mat4 mat4Shadow;

            // retourne 1.0 si le point est éclairé, 0.0 s'il est dans l'ombre
            float isIlluminated(in vec4 position)
            {
                // calculer les coordonnées du vertex dans la shadow map
                vec4 posshadow = mat4Shadow * position;

                // normaliser les coordonnées homogènes
                posshadow /= posshadow.w;

                // distance entre ce fragment et la lumière
                float distancePointLight = posshadow.z;

                // comparer la valeur donnée par la ShadowMap avec la distance du fragment à la lumière
                float distanceObstacleLight = texture2D(ShadowMap, posshadow.xy).r;
                return step(distancePointLight, distanceObstacleLight);
            }

            void main()
            {
                // couleur diffuse du matériau en ce point
                vec3 Kd = texture2D(texDiffuse, frgTexCoords).rgb;

                // éclairement ambiant : 20%
                gl_FragColor = vec4(Kd * 0.2, 1.0);

                // vecteurs N, -V et Rv
                vec3 N = normalize(frgN);
                vec3 mV = normalize(frgPosition.xyz);
                vec3 Rv = reflect(mV, N);

                // direction de la lumière dans le repère caméra
                vec3 L = LightPosition.xyz - frgPosition.xyz * LightPosition.w;
                float dist = length(L);
                L /= dist;

                // présence dans le cône du spot
                float visib = smoothstep(cosmaxangle, cosminangle, dot(-L, LightDirection.xyz));

                // diminution de l'intensité à cause de la distance
                visib /= dist*dist;

                // fragment dans l'ombre ou éclairé ?
                visib *= isIlluminated(frgPosition);

                // éclairement diffus
                float dotNL = clamp(dot(N, L), 0.0, 1.0);
                gl_FragColor += vec4(Kd * LightColor * dotNL * visib, 1.0);

                // éclairement spéculaire de Phong
                float dotRL = clamp(dot(Rv,L), 0.0, 1.0);
                gl_FragColor += vec4(Ks * LightColor * pow(dotRL, ns) * visib, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialGround");

        // autres initialisations
        this.m_ShadowMap = null;

        // emplacement des variables uniform spécifiques
        this.m_TexDiffuseLoc     = gl.getUniformLocation(this.m_ShaderId, "texDiffuse");
        this.m_LightColorLoc     = gl.getUniformLocation(this.m_ShaderId, "LightColor");
        this.m_LightPositionLoc  = gl.getUniformLocation(this.m_ShaderId, "LightPosition");
        this.m_LightDirectionLoc = gl.getUniformLocation(this.m_ShaderId, "LightDirection");
        this.m_CosMaxAngleLoc    = gl.getUniformLocation(this.m_ShaderId, "cosmaxangle");
        this.m_CosMinAngleLoc    = gl.getUniformLocation(this.m_ShaderId, "cosminangle");
        this.m_ShadowMapLoc      = gl.getUniformLocation(this.m_ShaderId, "ShadowMap");
        this.m_ShadowMatrixLoc   = gl.getUniformLocation(this.m_ShaderId, "mat4Shadow");

        // charge l'image du sol en tant que texture
        this.m_Texture = new Texture2D("data/4016.jpg", gl.LINEAR_MIPMAP_LINEAR, gl.REPEAT);
    }


    /**
     * définit la lampe
     * @param light : instance de Light spécifiant les caractéristiques de la lampe
     */
    setLight(light)
    {
        if (light == null) {
            this.m_ShadowMap = null;
        } else {

            // activer le shader
            gl.useProgram(this.m_ShaderId);

            // fournir les caractéristiques dans les variables uniform
            vec3.glUniform(this.m_LightColorLoc,     light.getColor());
            vec4.glUniform(this.m_LightPositionLoc,  light.getPosition());
            vec4.glUniform(this.m_LightDirectionLoc, light.getDirection());
            gl.uniform1f(this.m_CosMinAngleLoc, light.getCosMinAngle());
            gl.uniform1f(this.m_CosMaxAngleLoc, light.getCosMaxAngle());

            // shadow map et sa matrice
            mat4.glUniformMatrix(this.m_ShadowMatrixLoc, light.m_ShadowMatrix);
            this.m_ShadowMap = light.m_ShadowMap;
        }
    }


    /**
     * active le matériau
     * @param mesh : maillage pour avoir les VBO
     * @param matP : matrice de projection à transmettre au shader
     * @param matV : matrice de vue à transmettre au shader
     */
    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TexDiffuseLoc);

        // activer la shadow map sur l'unité 1
        if (this.m_ShadowMap != null) {
            this.m_ShadowMap.setTextureUnit(gl.TEXTURE1, this.m_ShadowMapLoc, this.m_ShadowMap.getDepthBuffer());
        }
    }


    /**
     * désactive le matériau : shader et textures
     */
    deselect()
    {
        // libérer les samplers
        this.m_Texture.setTextureUnit(gl.TEXTURE0);
        if (this.m_ShadowMap != null) {
            this.m_ShadowMap.setTextureUnit(gl.TEXTURE1);
        }

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }


    /**
     * supprime les ressources allouées par cette instance
     */
    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer la texture
        this.m_Texture.destroy();
    }
}
