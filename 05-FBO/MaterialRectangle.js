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

            void main()
            {
                // accès au texel
                vec3 color = texture2D(txColor, frgTexCoords).rgb;

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
