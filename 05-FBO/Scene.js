// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Rectangle");
Requires("Grid");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer la scène n°1
        this.m_Scene1 = new Scene1();

        // créer le FBO pour dessiner la scène 1
        this.m_FBOscene1 = new FrameBufferObject(1024, 768);

        // donner les dimensions du FBO à la scène 1
        this.m_Scene1.onSurfaceChanged(1024, 768);

        // créer le matériau du rectangle, basé sur le FBO
        this.m_MaterialRectangle = new MaterialRectangle(this.m_FBOscene1);

        // créer les objets à dessiner
        this.m_Grid = new Grid(5, 5);
        this.m_Rectangle = new Rectangle(this.m_MaterialRectangle);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // gestion souris
        this.m_Azimut    = 20.0;
        this.m_Elevation = 20.0;
        this.m_Distance  = 17.0;
        this.m_Clicked   = false;

        // matrices
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


    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);

        // matrice de projection
        this.m_MatP = mat4.create();
        mat4.perspective(this.m_MatP, Utils.radians(18.0), width / height, 0.01, 100.0);
    }


    onDrawFrame()
    {
        // dessiner la scène 1 dans le FBO
        this.m_FBOscene1.enable();
        this.m_Scene1.onDrawFrame();
        this.m_FBOscene1.disable();
        //this.m_FBOscene1.onDraw(); return;

        // effacer l'écran en gris très clair
        gl.clearColor(0.8, 0.8, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra
        mat4.identity(this.m_MatV);

        // éloignement de la scène
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0.0, -0.7, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));

        // dessiner la grille au sol
        this.m_Grid.onDraw(this.m_MatP, this.m_MatV);

        // dessiner plusieurs rectangles de ci, de là
        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(1.0, 0.0, -2.0));
        mat4.rotateY(this.m_MatVM, this.m_MatVM, Utils.radians(-30.0));
        this.m_Rectangle.onDraw(this.m_MatP, this.m_MatVM);

        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(-2.0, 0.0, 0.0));
        mat4.rotateY(this.m_MatVM, this.m_MatVM, Utils.radians(40.0));
        this.m_Rectangle.onDraw(this.m_MatP, this.m_MatVM);

        mat4.translate(this.m_MatVM, this.m_MatV, vec3.fromValues(2.0, 0.0, 1.5));
        mat4.rotateY(this.m_MatVM, this.m_MatVM, Utils.radians(0.0));
        this.m_Rectangle.onDraw(this.m_MatP, this.m_MatVM);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_MaterialRectangle.destroy();
        this.m_Rectangle.destroy();
        this.m_Grid.destroy();
        this.m_Scene1.destroy();
        this.m_FBOscene1.destroy();
    }
}
