// Définition de la classe MaterialProc

Requires("Material");


class MaterialProc extends Material
{
    constructor()
    {
        let srcVertexShader = dedent
            `#version 300 es

            // matrices de transformation
            uniform mat4 matP;
            uniform mat4 matVM;

            // informations des sommets (VBO)
            in vec3 glVertex;
            in vec2 glTexCoords;

            // informations allant vers le fragment shader
            out vec2 frgTexCoords;
            out vec4 frgPositionObjet;

            void main()
            {
                frgPositionObjet = vec4(glVertex, 0.0);
                vec4 posCamera = matVM * vec4(glVertex, 1.0);
                gl_Position = matP * posCamera;
                frgTexCoords = glTexCoords;
            }`;

        let srcFragmentShader = dedent
            `#version 300 es
            precision mediump float;

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

            // temps écoulé
            uniform float time;

            // informations venant du vertex shader
            in vec2 frgTexCoords;
            in vec4 frgPositionObjet;

            // sortie du shader
            out vec4 glFragColor;

            void main()
            {
                // distance au centre de l'espace des textures
                float d = 1.0 - 2.0*distance(frgTexCoords, vec2(0.5));
                
                /*
                float r = pow(sin(frgTexCoords.s * 40.0 + time * 5.0 ), 50.0);
                float g = sin(frgTexCoords.t * 32.0 + 0.4 * sin(frgTexCoords.s * 40.0 + time * 2.5));
                float b = d;
                glFragColor = vec4(d*r, d*g, d*b, 1.0);
                */
                
                vec3 hsv = vec3(frgTexCoords.s + sin(time * 2.0), 1.0, 1.0);
                vec3 rgb = hsv2rgb(hsv);
                
                glFragColor = vec4(rgb, 1.0);
            }`;

        // compile le shader, recherche les emplacements des uniform et attribute communs
        super(srcVertexShader, srcFragmentShader, "MaterialProc");
    }
}
