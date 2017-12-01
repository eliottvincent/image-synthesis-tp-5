// Définition de la classe MaterialRectangle

Requires("Material");
Requires("Texture2D");


class MaterialRectangle extends Material
{
    /**
     * définit un matériau pour appliquer une texture ou un FBO
     * @param texture : Texture2D ou FrameBufferObject
     */
    constructor(texture)
    {
        let srcVertexShader = dedent
            `#version 100
            uniform mat4 matP;
            uniform mat4 matVM;
            attribute vec3 glVertex;
            attribute vec2 glTexCoords;
            varying vec2 frgTexCoords;
            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 100
            precision mediump float;
            varying vec2 frgTexCoords;
            uniform sampler2D txColor;
            uniform float time;

            // conversion RGB en HSV
            vec3 rgb2hsv(vec3 c)
            {
                vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
                vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
                vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
                float d = q.x - min(q.w, q.y);
                float e = 1.0e-10;
                return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
            }

            // conversion HSV en RGB
            vec3 hsv2rgb(vec3 c)
            {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main()
            {
                // altération des coordonnées de texture
                vec2 modTexCoords = frgTexCoords;
                const vec2 center = vec2(0.5, 0.5);
                const vec2 ratio = vec2(1024.0 / 768.0, 1.5);
                // modTexCoords = (modTexCoords - center) * 0.7 + center;
                
                // conversation coordonnées cartésiennes -> polaires 
                modTexCoords = modTexCoords - center;
                float r = length(modTexCoords);
                float a = atan(modTexCoords.t, modTexCoords.s);

                // bizarre
                // r = pow(r, 2.0);

                // vagues 
                // r = r + 0.02 * pow( sin(12.0 * r - time * 6.0), 7.0) ;

                // rigolo + psychédélique
                // r = r + pow(sin(r+ time), 7.0) ;

                // altération de l'angle en fonction de la distance
                // a = a + 2.0 * (0.707-r);

                // penser à faire la conversion inverse (polaires -> cartésiennes) 
                modTexCoords = r * vec2(cos(a), sin(a)) + center;

                // distance au centre on peut utiliser pow ou sqrt
                float dist = distance(modTexCoords, center);

                // loupe (éloigner en fct de la distance)
                modTexCoords = (modTexCoords - center) * dist * ratio + center;

                // inversion de haut en bas 
                // modTexCoords.t = 1.0 - modTexCoords.t;

                // chercher les points vers le bas de l'image 
                // modTexCoords.t =  modTexCoords.t * 0.5;

                // transformation affine avec le centre pour n'afficher que celui là
                // modTexCoords = (modTexCoords - center)*0.5 + center;

                // accès au texel à ces nouvelles coordonnées de texture
                const float d = 0.002;
                vec3 color00 = texture2D(txColor, modTexCoords + vec2(-d, -d)).rgb;
                vec3 color01 = texture2D(txColor, modTexCoords + vec2(-d, 0)).rgb;
                vec3 color02 = texture2D(txColor, modTexCoords + vec2(-d, +d)).rgb;
                vec3 color03 = texture2D(txColor, modTexCoords + vec2(0, -d)).rgb;
                vec3 color04 = texture2D(txColor, modTexCoords + vec2(0, 0)).rgb;
                vec3 color05 = texture2D(txColor, modTexCoords + vec2(0, +d)).rgb;
                vec3 color06 = texture2D(txColor, modTexCoords + vec2(+d, -d)).rgb;
                vec3 color07 = texture2D(txColor, modTexCoords + vec2(+d, 0)).rgb;
                vec3 color08 = texture2D(txColor, modTexCoords + vec2(+d, +d)).rgb;

                // noyau de convolution 
                vec3 color = -1.0*color00 + -1.0*color01 + -1.0*color02 + 
                            -1.0*color03 + 9.0*color04 + -1.0*color05 + 
                            -1.0*color06 + -1.0*color07 + -1.0*color08;
                 
                // modification de la couleur, exemple
                // color = clamp(color*2.0 - 0.5, 0.0, 1.0);
                // color = 1.0 - color; // couleur inverse (negatif photo)
                vec3 hsv = rgb2hsv(color);  // on passe en hsv
                // hsv.g = 0.0;    // desaturation
                color = hsv2rgb(hsv);   // on repasse en rgb
                
                gl_FragColor = vec4(color, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialRectangle");

        // emplacement des variables uniform spécifiques
        this.m_TextureLoc = gl.getUniformLocation(this.m_ShaderId, "txColor");

        // texture associée à ce matériau
        this.m_Texture = texture;
    }


    select(mesh, matP, matVM)
    {
        // méthode de la superclasse (active le shader)
        super.select(mesh, matP, matVM);

        // activer la texture sur l'unité 0
        this.m_Texture.setTextureUnit(gl.TEXTURE0, this.m_TextureLoc);
    }


    deselect()
    {
        // libérer le sampler
        this.m_Texture.setTextureUnit(gl.TEXTURE0);

        // méthode de la superclasse (désactive le shader)
        super.deselect();
    }
}
