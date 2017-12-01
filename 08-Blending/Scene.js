// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Rectangle");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les rectangles qui représentent les couches à fusionner
        this.m_Background = new Rectangle("data/textures/hill-meadow-tree-green-2048.jpg", 1.33, 1.0);
        this.m_Clouds = new Rectangle("data/textures/nuages.png", 1.33, 1.0);
        this.m_PalmTree = new Rectangle("data/textures/treeM044.png", 1.0, 2.0);
        this.m_SmallTree = new Rectangle("data/textures/plantM060.png", 1.0, 1.33);

        // configurer les modes de dessin
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);      // laisser voir le dos du rectangle

        // couleur du fond
        gl.clearColor(0.4, 0.4, 0.4, 0.0);

        // gestion souris
        this.m_Azimut    = 0.0;
        this.m_Elevation = 0.0;
        this.m_Distance  = 15.0;
        this.m_Clicked   = false;

        // matrices
        this.m_MatP = mat4.create();
        this.m_MatV = mat4.create();
        this.m_MatVM = mat4.create();
    }


    /**
     * appelée quand on appuie sur une touche du clavier
     * @param code : touche enfoncée
     */
    onKeyDown(code)
    {
        switch (code) {
        case 'Z':
            this.m_Distance *= Math.exp(-0.01);
            break;
        case 'S':
            this.m_Distance *= Math.exp(+0.01);
            break;
        }
    }

    onMouseDown(btn, x, y)
    {
        this.m_Clicked = true;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }

    onMouseUp(btn, x, y)
    {
        this.m_Clicked = false;
    }

    onMouseMove(x, y)
    {
        if (! this.m_Clicked) return;
        this.m_Azimut  += (x - this.m_MousePrecX) * 0.1;
        this.m_Elevation += (y - this.m_MousePrecY) * 0.1;
        if (this.m_Elevation >  90.0) this.m_Elevation =  90.0;
        if (this.m_Elevation < -90.0) this.m_Elevation = -90.0;
        this.m_MousePrecX = x;
        this.m_MousePrecY = y;
    }


    /**
     * appelée quand la taille de la vue OpenGL change
     * @param width : largeur en nombre de pixels de la fenêtre
     * @param height : hauteur en nombre de pixels de la fenêtre
     */
    onSurfaceChanged(width, height)
    {
        // matrice de projection (champ de vision)
        mat4.perspective(this.m_MatP, Utils.radians(8.0), width / height, 0.1, 20.0);
    }


    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra
        mat4.identity(this.m_MatV);

        // éloignement de la scène
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0.0, 0.0, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));

        // dessiner le fond
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(0.0,0.0,-1.0));
        this.m_Background.onDraw(this.m_MatP, this.m_MatVM);

        // formule de blending (si unique, la mettre dans le constructeur)
        gl.blendColor(0.3, 0.3, 0.3, 0.3);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.CONSTANT_COLOR);
        // gl.blendFunc(gl.ONE_MINUS_CONSTANT_COLOR, gl.CONSTANT_COLOR);
        //gl.blendFunc(gl.ONE, gl.ONE);
        //gl.blendFunc(gl.ZERO, gl.ONE);
        //gl.blendFunc(gl.ONE, gl.ZERO);
        //gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        //gl.blendEquation(gl.FUNC_SUBTRACT);
        //gl.blendFunc(gl.ONE, gl.ONE);
        //gl.blendFunc(gl.ONE, gl.SRC_ALPHA);

        //gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);
        //gl.blendFunc(gl.ONE, gl.ONE);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        // activer le mode blending
        gl.enable(gl.BLEND);

        // dessiner les nuages
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(-0.2,0.7,-0.5));
        this.m_Clouds.onDraw(this.m_MatP, this.m_MatVM);

        // dessiner le palmier
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(0.2,0.2, 0.0));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.5,0.5,0.5));
        this.m_PalmTree.onDraw(this.m_MatP, this.m_MatVM);

        // dessiner l'arbuste
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(-0.2,-0.3,0.5));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.5,0.5,0.5));
        this.m_SmallTree.onDraw(this.m_MatP, this.m_MatVM);

        // désactiver le mode blending
        gl.disable(gl.BLEND);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_SmallTree.destroy();
        this.m_PalmTree.destroy();
        this.m_Clouds.destroy();
        this.m_Background.destroy();
        super.destroy();
    }
}
