// Définition de la classe FrameBufferObject

class FrameBufferObject
{
    /**
     * constructeur de la classe FrameBufferObject
     * @param width largeur du FBO (nombre de pixels)
     * @param height hauteur du FBO
     * @param color : fournir gl.NONE si aucun, gl.TEXTURE_2D si on veut un buffer de type texture, gl.RENDERBUFFER si c'est un renderbuffer
     * @param depth : fournir gl.NONE si aucun, gl.TEXTURE_2D si on veut un buffer de type texture, gl.RENDERBUFFER si c'est un renderbuffer, NB: il faut impérativement un depth buffer dans un FBO destiné à être rendu
     * @param filtering : filtrage des textures, mettre gl.NEAREST ou gl.LINEAR (valeur par défaut)
     */
    constructor(width, height, color=gl.TEXTURE_2D, depth=gl.RENDERBUFFER, filtering=gl.LINEAR)
    {
        // le type gl.FLOAT ne passe pas avec WebGL2
        let FBOcolor = gl.UNSIGNED_BYTE;
        let FBOdepth = gl.DEPTH_COMPONENT16;

        // extensions nécessaires selon la version de WebGL
        if (gl.isWebGL2) {

            let floatTextureExt = gl.getExtension("EXT_color_buffer_float");
            if (!floatTextureExt) {
                let msg = "Extension EXT_color_buffer_float is missing, see http://webglreport.com";
                throw msg;
            }

        } else {

            let floatTextureExt = gl.getExtension("OES_texture_float");
            if (!floatTextureExt) {
                let msg = "Extension OES_texture_float is missing, see http://webglreport.com";
                throw msg;
            }

            let floatLinearTextureExt = gl.getExtension("OES_texture_float_linear");
            if (!floatLinearTextureExt) {
                let msg = "Extension OES_texture_float_linear is missing, see http://webglreport.com";
                throw msg;
            }

            let depthTextureExt = gl.getExtension("WEBGL_depth_texture");
            if (!depthTextureExt) {
                let msg = "Extension WEBGL_depth_texture is missing, see http://webglreport.com";
                throw msg;
            }

            let drawBuffersExt = gl.getExtension("WEBGL_draw_buffers");
            if (!drawBuffersExt) {
                let msg = "Extension WEBGL_draw_buffers is missing, see http://webglreport.com";
                throw msg;
            }
            gl.drawBuffers = drawBuffersExt.drawBuffersWEBGL();
            FBOcolor = gl.FLOAT;
            FBOdepth = gl.DEPTH_COMPONENT;
        }

        // variables d'instance
        this.m_FBO = null;
        this.m_ColorBufferId = null;
        this.m_DrawBufferNames = [];
        this.m_DepthBufferId = null;
        this.m_Width = width;
        this.m_Height = height;
        this.m_PrecFBO = null;

        // créer le FBO
        this.m_FBO = gl.createFramebuffer(1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_FBO);

        // identifiant du buffer courant
        let bufferId = null;

        // créer le buffer de couleur principal, rempli par gl_FragColor ou gl_FragData[0]
        switch (color) {

        case gl.TEXTURE_2D:
            // créer une texture 2D pour recevoir les dessins faits via le FBO
            bufferId = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, bufferId);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, FBOcolor, null);

            // configurer la texture
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);

            // attacher la texture au FBO
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bufferId, 0);
            this.m_ColorBufferId = bufferId;
            this.m_DrawBufferNames.push(gl.COLOR_ATTACHMENT0);
            break;

        case gl.RENDERBUFFER:
            // lui ajouter un color buffer de type render buffer
            bufferId = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, bufferId);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA, width, height);

            // attacher le render buffer au FBO
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, bufferId);
            this.m_ColorBufferId = bufferId;
            this.m_DrawBufferNames.push(gl.COLOR_ATTACHMENT0);
            break;

        case gl.NONE:
            break;

        default:
            console.error("FrameBufferObject: color is not among gl.NONE, gl.TEXTURE_2D, gl.TEXTURE_CUBE_MAP, gl.RENDERBUFFER");
        }

        // créer le buffer de profondeur, rempli automatiquement par gl_FragDepth
        switch (depth) {

        case gl.TEXTURE_2D:
            // lui ajouter un depth buffer de type texture
            this.m_DepthBufferId = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.m_DepthBufferId);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

            // configurer la texture
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.NONE);

            // couleur du bord (n'existe pas en WebGL)
            //let borderColor = [1.0,1.0,1.0,0.0];
            //gl.texParameterfv(gl.TEXTURE_2D, gl.TEXTURE_BORDER_COLOR, borderColor);

            // attacher le depth buffer au FBO
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.m_DepthBufferId, 0);
            break;

        case gl.RENDERBUFFER:
            // lui ajouter un depth buffer de type render buffer
            this.m_DepthBufferId = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.m_DepthBufferId);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

            // attacher le depth buffer au FBO
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.m_DepthBufferId);
            break;

        case gl.NONE:
            // voir la remarque dans https://www.opengl.org/wiki/Framebuffer_Object
            // Even if you don't plan on reading from this depth_attachment, an off screen bufferId that will be rendered to should have a depth attachment.
            break;

        default:
            console.error("FrameBufferObject: depth is not among gl.NONE, gl.TEXTURE_2D, gl.TEXTURE_CUBE_MAP, gl.RENDERBUFFER");
        }

        // indiquer quels sont les buffers utilisés pour le dessin (gl_FragData valides)
        gl.drawBuffers(this.m_DrawBufferNames);

        // vérifier l'état des lieux
        this.checkStatus();

        // désactiver le FBO pour l'instant
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // initialisation statique ?
        if (typeof FrameBufferObject.m_VertexBufferId === 'undefined') FrameBufferObject.staticinit();
    }


    /**
     * vérifie l'état du FBO
     */
    checkStatus()
    {
        let code = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        let status;
        switch (code) {
            case gl.FRAMEBUFFER_COMPLETE:
                status="FRAMEBUFFER_COMPLETE";
                break;
            case gl.FRAMEBUFFER_UNDEFINED:
                status="FRAMEBUFFER_UNDEFINED";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                status="FRAMEBUFFER_INCOMPLETE_ATTACHMENT";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                status="FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER:
                status="FRAMEBUFFER_INCOMPLETE_DRAW_BUFFER";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_READ_BUFFER:
                status="FRAMEBUFFER_INCOMPLETE_READ_BUFFER";
                break;
            case gl.FRAMEBUFFER_UNSUPPORTED:
                status="FRAMEBUFFER_UNSUPPORTED";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                status="FRAMEBUFFER_INCOMPLETE_DIMENSIONS";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
                status="FRAMEBUFFER_INCOMPLETE_MULTISAMPLE";
                break;
            case gl.FRAMEBUFFER_INCOMPLETE_LAYER_TARGETS:
                status="FRAMEBUFFER_INCOMPLETE_LAYER_TARGETS";
                break;
            default:
                status="FRAMEBUFFER_??"+" (code "+code+")";
                break;
        }
        if (code != gl.FRAMEBUFFER_COMPLETE) {
            // signaler une erreur
            console.log("FrameBufferObject : creating FBO "+this.m_Width+"x"+this.m_Height+" : "+status);
            error("creating FBO : "+status);
        }
    }


    /**
     * supprime ce FBO
     */
    destroy()
    {
        // déterminer quels sont les types des attachements
        gl.bindFramebuffer(gl.FRAMEBUFFER, m_FBO);
        let color = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);
        let depth = gl.getFramebufferAttachmentParameter(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE);

        // supprimer le FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(this.m_FBO);

        // libérer le color buffer s'il y en a un
        switch (color) {
        case gl.TEXTURE:
            gl.deleteTexture(this.m_ColorBufferId);
            break;
        case gl.RENDERBUFFER:
            gl.deleteRenderbuffer(this.m_ColorBufferId);
            break;
        }

        // libérer le depth buffer s'il y en a un
        switch (depth) {
        case gl.TEXTURE:
            gl.deleteTexture(this.m_DepthBufferId);
            break;
        case gl.RENDERBUFFER:
            gl.deleteRenderbuffer(this.m_DepthBufferId);
            break;
        }

        // ne plus garder de référence sur ces buffers
        this.m_FBO = null;
        this.m_ColorBufferId = null;
        this.m_DepthBufferId = null;
    }


    /**
     * redirige tous les tracés suivants vers le FBO
     */
    enable()
    {
        // sauver le viewport
        this.m_Viewport = gl.getParameter(gl.VIEWPORT);

        // redéfinir le viewport pour correspondre au FBO
        gl.viewport(0, 0, this.m_Width, this.m_Height);

        // enregistrer le précédent FBO actif
        this.m_PrecFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);

        // activer le FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_FBO);
    }


    /**
     * redirige tous les tracés suivants vers l'écran à nouveau
     */
    disable()
    {
        // désactiver le FBO, remettre le précédent en place
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.m_PrecFBO);

        // remettre le viewport à ce qu'il était avant
        gl.viewport(this.m_Viewport[0], this.m_Viewport[1], this.m_Viewport[2], this.m_Viewport[3]);
    }


    /**
     * retourne l'identifiant du Color Buffer
     * @return color buffer de ce FBO
     */
    getColorBuffer()
    {
        return this.m_ColorBufferId;
    }


    /**
     * retourne l'identifiant du Depth Buffer
     * @return depth buffer de ce FBO
     */
    getDepthBuffer()
    {
        return this.m_DepthBufferId;
    }


    /**
     * retourne la largeur de ce FBO
     * @return largeur
     */
    getWidth()
    {
        return this.m_Width;
    }


    /**
     * retourne la hauteur de ce FBO
     * @return hauteur
     */
    getHeight()
    {
        return this.m_Height;
    }


    /**
     * cette fonction associe l'une des textures de ce FBO à une unité pour un shader
     * NB: le shader concerné doit être actif
     * @param unit : unité de texture concernée, par exemple gl.TEXTURE0
     * @param locSampler : emplacement de la variable uniform sampler* de cette texture dans le shader ou null pour désactiver la texture
     * @param bufferId : le buffer retourné par getColorBuffer ou getDepthBuffer ou null pour désactiver
     */
    setTextureUnit(unit, locSampler=null, bufferId=null)
    {
        /*****DEBUG*****/
        if (unit < gl.TEXTURE0 || unit > gl.TEXTURE7) {
            error("FrameBufferObject.setTextureUnit: first parameter, unit is not gl.TEXTURE0 ... gl.TEXTURE7");
        }
        if (locSampler != null && locSampler.constructor !== WebGLUniformLocation) {
            error("FrameBufferObject.setTextureUnit: second parameter, locSampler is not either null or the location of a uniform variable : "+locSampler);
        }
        /*****DEBUG*****/
        gl.activeTexture(unit);
        if (locSampler == null) {
            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            if (bufferId == null) bufferId = this.m_ColorBufferId;
            gl.bindTexture(gl.TEXTURE_2D, bufferId);
            gl.uniform1i(locSampler, unit-gl.TEXTURE0);
        }
    }



    /*** Tout ce qui suit concerne l'affichage du FBO sur l'écran pour la mise au point ***/

    /**
     * construit les structures de données permettant de dessiner les FBO sur l'écran
     * @see #onDraw
     */
    static staticinit()
    {
        /// générer un shader et un VBO pour dessiner l'un des buffers de ce FBO
        let VertexShader = dedent
            `#version 100
            attribute vec2 glVertex;
            attribute vec2 glTexCoord;
            varying vec2 frgTexCoord;
            void main()
            {
                gl_Position = vec4(glVertex, 0.0, 1.0);
                frgTexCoord = glTexCoord;
            }`;
        let FragmentShaderRGB = dedent
            `#version 100
            precision mediump float;
            uniform sampler2D Buffer;
            varying vec2 frgTexCoord;
            void main()
            {
                gl_FragColor = texture2D(Buffer, frgTexCoord);
            }`;

        // compiler le shader de dessin
        FrameBufferObject.m_ShaderRGBId = Utils.makeShaderProgram(VertexShader, FragmentShaderRGB, "FrameBufferObjectRGB");

        // déterminer où sont les variables attribute et uniform
        FrameBufferObject.m_VertexRGBLoc   = gl.getAttribLocation(FrameBufferObject.m_ShaderRGBId, "glVertex");
        FrameBufferObject.m_TexCoordRGBLoc = gl.getAttribLocation(FrameBufferObject.m_ShaderRGBId, "glTexCoord");
        FrameBufferObject.m_BufferRGBLoc   = gl.getUniformLocation(FrameBufferObject.m_ShaderRGBId, "Buffer");

        /// générer un shader et un VBO pour dessiner le canal alpha de l'un des buffers de ce FBO
        let FragmentShaderAlpha = dedent
            `#version 100
            precision mediump float;
            uniform sampler2D Buffer;
            varying vec2 frgTexCoord;
            void main()
            {
                float a = texture2D(Buffer, frgTexCoord).a;
                gl_FragColor = vec4(a,a,a,1.0);
            }`;

        // compiler le shader de dessin
        FrameBufferObject.m_ShaderAlphaId = Utils.makeShaderProgram(VertexShader, FragmentShaderAlpha, "FrameBufferObjectAlpha");

        // déterminer où sont les variables attribute et uniform
        FrameBufferObject.m_VertexAlphaLoc   = gl.getAttribLocation(FrameBufferObject.m_ShaderAlphaId, "glVertex");
        FrameBufferObject.m_TexCoordAlphaLoc = gl.getAttribLocation(FrameBufferObject.m_ShaderAlphaId, "glTexCoord");
        FrameBufferObject.m_BufferAlphaLoc   = gl.getUniformLocation(FrameBufferObject.m_ShaderAlphaId, "Buffer");

        /// générer un shader et un VBO pour dessiner le depth buffer de ce FBO
        let FragmentShaderDepth = dedent
            `#version 100
            precision mediump float;
            uniform sampler2D Buffer;
            varying vec2 frgTexCoord;
            void main()
            {
                float d = texture2D(Buffer, frgTexCoord).r;
                gl_FragColor = vec4(d,d,d,1.0);
            }`;

        // compiler le shader de dessin
        this.m_ShaderDepthId = Utils.makeShaderProgram(VertexShader, FragmentShaderDepth, "FrameBufferObjectDepth");

        // déterminer où sont les variables attribute et uniform
        FrameBufferObject.m_VertexDepthLoc   = gl.getAttribLocation(FrameBufferObject.m_ShaderDepthId, "glVertex");
        FrameBufferObject.m_TexCoordDepthLoc = gl.getAttribLocation(FrameBufferObject.m_ShaderDepthId, "glTexCoord");
        FrameBufferObject.m_BufferDepthLoc   = gl.getUniformLocation(FrameBufferObject.m_ShaderDepthId, "Buffer");

        // créer et remplir le buffer des coordonnées
        let vertices =  [ -1,-1,  +1,-1,  +1,+1,  -1,+1 ];
        FrameBufferObject.m_VertexBufferId = Utils.makeFloatVBO(vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
        let texcoords = [  0, 0,   1, 0,   1, 1,   0, 1 ];
        FrameBufferObject.m_TexCoordBufferId = Utils.makeFloatVBO(texcoords, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    }


    /**
     * supprime les shaders et VBO de dessin
     */
    static staticdestroy()
    {
        Utils.deleteShaderProgram(FrameBufferObject.m_ShaderRGBId);
        Utils.deleteShaderProgram(FrameBufferObject.m_ShaderDepthId);
        Utils.deleteShaderProgram(FrameBufferObject.m_ShaderAlphaId);
        Utils.deleteVBO(FrameBufferObject.m_VertexBufferId);
        Utils.deleteVBO(FrameBufferObject.m_TexCoordBufferId);
    }


    /**
     * dessine l'un des buffers dans le viewport (pour mise au point)
     * @param attachment : mettre gl.COLOR_ATTACHMENT0 pour le color buffer, gl.DEPTH_ATTACHMENT pour le depth buffer
     * @param alpha : true si on dessine le canal alpha du color buffer
     */
    onDraw(attachment=gl.COLOR_ATTACHMENT0, alpha=false)
    {
        switch (attachment) {
            case gl.DEPTH_ATTACHMENT:
                this.onDrawDepth();
                break;
            default:
                if (alpha) {
                    this.onDrawAlpha();
                } else {
                    this.onDrawRGB();
                }
                break;
        }
    }


    /**
     * dessine le color buffer dans le viewport (pour mise au point)
     */
    onDrawRGB()
    {
        // désactiver le test du depth buffer
        gl.disable(gl.DEPTH_TEST);

        // activer le shader
        gl.useProgram(FrameBufferObject.m_ShaderRGBId);

        // activer et lier le buffer contenant les coordonnées
        gl.enableVertexAttribArray(FrameBufferObject.m_VertexRGBLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, FrameBufferObject.m_VertexBufferId);
        gl.vertexAttribPointer(FrameBufferObject.m_VertexRGBLoc, 2, gl.FLOAT, gl.FALSE, 0, null);

        // activer et lier le buffer contenant les coordonnées de texture
        gl.enableVertexAttribArray(FrameBufferObject.m_TexCoordRGBLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, FrameBufferObject.m_TexCoordBufferId);
        gl.vertexAttribPointer(FrameBufferObject.m_TexCoordRGBLoc, 2, gl.FLOAT, gl.FALSE, 0, null);

        // activer la texture à dessiner (ne marche pas si ce sont des RenderBuffers)
        this.setTextureUnit(gl.TEXTURE0, FrameBufferObject.m_BufferRGBLoc, this.m_ColorBufferId);

        // dessiner un quadrilatère avec les quatre vertices
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // désactiver la texture
        this.setTextureUnit(gl.TEXTURE0);

        // désactiver le buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(FrameBufferObject.m_VertexRGBLoc);
        gl.disableVertexAttribArray(FrameBufferObject.m_TexCoordRGBLoc);

        // désactiver le shader
        gl.useProgram(null);

        // réactiver le test du depth buffer
        gl.enable(gl.DEPTH_TEST);
    }


    /**
     * dessine le canal alpha du color buffer dans le viewport (pour mise au point)
     */
    onDrawAlpha()
    {
        // désactiver le test du depth buffer
        gl.disable(gl.DEPTH_TEST);

        // activer le shader
        gl.useProgram(FrameBufferObject.m_ShaderAlphaId);

        // activer et lier le buffer contenant les coordonnées
        gl.enableVertexAttribArray(FrameBufferObject.m_VertexAlphaLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, FrameBufferObject.m_VertexBufferId);
        gl.vertexAttribPointer(FrameBufferObject.m_VertexAlphaLoc, 2, gl.FLOAT, gl.FALSE, 0, null);

        // activer et lier le buffer contenant les coordonnées de texture
        gl.enableVertexAttribArray(FrameBufferObject.m_TexCoordAlphaLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, FrameBufferObject.m_TexCoordBufferId);
        gl.vertexAttribPointer(FrameBufferObject.m_TexCoordAlphaLoc, 2, gl.FLOAT, gl.FALSE, 0, null);

        // activer la texture à dessiner (ne marche pas si ce sont des RenderBuffers)
        this.setTextureUnit(gl.TEXTURE0, FrameBufferObject.m_BufferAlphaLoc, this.m_ColorBufferId);

        // dessiner un quadrilatère avec les quatre vertices
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // désactiver la texture
        this.setTextureUnit(gl.TEXTURE0);

        // désactiver le buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(FrameBufferObject.m_VertexAlphaLoc);
        gl.disableVertexAttribArray(FrameBufferObject.m_TexCoordAlphaLoc);

        // désactiver le shader
        gl.useProgram(null);

        // réactiver le test du depth buffer
        gl.enable(gl.DEPTH_TEST);
    }


    /**
     * dessine le depth buffer dans le viewport (pour mise au point)
     */
    onDrawDepth()
    {
        // désactiver le test du depth buffer
        gl.disable(gl.DEPTH_TEST);

        // activer le shader
        gl.useProgram(FrameBufferObject.m_ShaderDepthId);

        // activer et lier le buffer contenant les coordonnées
        gl.enableVertexAttribArray(FrameBufferObject.m_VertexDepthLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, FrameBufferObject.m_VertexBufferId);
        gl.vertexAttribPointer(FrameBufferObject.m_VertexDepthLoc, 2, gl.FLOAT, gl.FALSE, 0, null);

        // activer et lier le buffer contenant les coordonnées de texture
        gl.enableVertexAttribArray(FrameBufferObject.m_TexCoordDepthLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, FrameBufferObject.m_TexCoordBufferId);
        gl.vertexAttribPointer(FrameBufferObject.m_TexCoordDepthLoc, 2, gl.FLOAT, gl.FALSE, 0, null);

        // activer la texture à dessiner (ne marche pas si c'est un RenderBuffer)
        this.setTextureUnit(gl.TEXTURE0, FrameBufferObject.m_BufferDepthLoc, this.m_DepthBufferId);

        // dessiner un quadrilatère avec les quatre vertices
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        // désactiver la texture
        this.setTextureUnit(gl.TEXTURE0);

        // désactiver le buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disableVertexAttribArray(FrameBufferObject.m_VertexDepthLoc);
        gl.disableVertexAttribArray(FrameBufferObject.m_TexCoordDepthLoc);

        // désactiver le shader
        gl.useProgram(null);

        // réactiver le test du depth buffer
        gl.enable(gl.DEPTH_TEST);
    }
}
