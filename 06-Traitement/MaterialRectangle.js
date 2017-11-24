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
                modTexCoords = (modTexCoords - center) * 0.7 + center;

                // accès au texel à ces nouvelles coordonnées de texture
                vec3 color = texture2D(txColor, modTexCoords).rgb;

                // modification de la couleur, exemple
                color = clamp(color*2.0 - 0.5, 0.0, 1.0);

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
