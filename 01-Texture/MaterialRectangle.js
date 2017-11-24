// Définition de la classe MaterialRectangle

Requires("Material");
Requires("Texture2D");


class MaterialRectangle extends Material
{
    constructor()
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
                gl_FragColor = texture2D(txColor, frgTexCoords);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialRectangle");

        // emplacement des variables uniform spécifiques
        this.m_TextureLoc = gl.getUniformLocation(this.m_ShaderId, "txColor");

        // charge l'image de la terre en tant que texture
        this.m_Texture = new Texture2D("data/earth_map.jpg", gl.NEAREST);
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


    destroy()
    {
        // méthode de la superclasse
        super.destroy();

        // supprimer la texture
        this.m_Texture.destroy();
    }
}
