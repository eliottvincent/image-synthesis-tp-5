// Définition de la classe MaterialPyramide

Requires("Material");


class MaterialPyramide extends Material
{
    /** constructeur */
    constructor()
    {
        let srcVertexShader = dedent
            `#version 100
            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;
            // informations des sommets (VBO)
            attribute vec3 glVertex;
            attribute vec3 glColor;
            // calculs allant vers le fragment shader
            varying vec3 frgColor;
            void main()
            {
                gl_Position = matP * matVM * vec4(glVertex, 1.0);
                frgColor = glColor;
            }`;

        let srcFragmentShader = dedent
            `#version 100
            precision mediump float;
            // informations venant du vertex shader
            varying vec3 frgColor;
            void main()
            {
                gl_FragColor = vec4(frgColor, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialPyramide");
    }
}
