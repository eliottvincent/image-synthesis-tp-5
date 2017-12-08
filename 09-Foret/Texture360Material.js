// Définition de la classe Texture360Material

// superclasses et classes nécessaires
Requires("Material");
Requires("Texture360");


class Texture360Material extends Material
{
    /**
     * Constructeur
     * @param texture360 sur laquelle est basé le matériau
     */
    constructor(texture360)
    {
        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec2 glTexCoords;
            out vec2 frgTexCoords;

            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

            // couleur du matériau donnée par une texture
            uniform sampler2D txColor;
            uniform float coefColor;
            uniform float coefAlpha;

            // informations venant du vertex shader
            in vec2 frgTexCoords;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // accès à la texture
                vec4 color = texture(txColor, frgTexCoords);
                if (color.a <= 0.01) discard;

                // modulation de la couleur et la transparence
                glFragColor = vec4(color.rgb*coefColor, color.a*coefAlpha);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "Texture360Material");

        // emplacement des variables uniform spécifiques
        this.m_TextureLoc   = gl.getUniformLocation(this.m_ShaderId, "txColor");
        this.m_CoefColorLoc = gl.getUniformLocation(this.m_ShaderId, "coefColor");
        this.m_CoefAlphaLoc = gl.getUniformLocation(this.m_ShaderId, "coefAlpha");

        // mémoriser la texture
        this.m_Texture360 = texture360;

        // modification de la couleur et transparence
        this.m_CoefColor = 1.0;
        this.m_CoefAlpha = 1.0;
    }


    /**
     * modifie les coefficients de couleur et de transparence
     * @param coefColor : float de 0 à 1 multiplié par la couleur
     * @param coefAlpha : float de 0 à 1 multiplié par le coefficient alpha
     */
    setCoefficients(coefColor=1.0, coefAlpha=1.0)
    {
        this.m_CoefColor = coefColor;
        this.m_CoefAlpha = coefAlpha;
    }


    /**
     * sélectionne la Texture2D correspondant à l'angle
     * @param angle : float entre 0 et 1
     */
    setAngle(angle)
    {
        this.m_Texture = this.m_Texture360.setAngle(angle);
    }


    /**
     * Cette méthode active le matériau (shader, VBOs, matrices, autres variables uniform et texture)
     */
    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // spécifier le coefficient de teinte et le coefficient de transparence
        gl.uniform1f(this.m_CoefColorLoc, this.m_CoefColor);
        gl.uniform1f(this.m_CoefAlphaLoc, this.m_CoefAlpha);

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TextureLoc);
    }


    /**
     * Cette méthode désactive le matériau
     */
    deselect()
    {
        // libérer le sampler
        this.m_Texture.setTextureUnit(gl.TEXTURE0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }


    /**
     * Cette méthode supprime les ressources allouées
     */
    destroy()
    {
        // méthode de la superclasse
        super.destroy();
    }
}
