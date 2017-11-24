// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Rectangle");
Requires("Grid");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_Rectangle = new Rectangle();
        this.m_Rock = new Rock();
        this.m_Grid = new Grid();

        // couleur du fond : gris très clair
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // gestion souris
        this.m_Azimut    = 20.0;
        this.m_Elevation = 20.0;
        this.m_Distance  = 16.0;
        this.m_Clicked   = false;

        // matrices
        this.m_MatV = mat4.create();
        this.m_MatVM = mat4.create();
        this.m_MatTMP = mat4.create();
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
        this.m_Azimut  += (x - this.m_MousePrecX) * 0.2;
        this.m_Elevation += (y - this.m_MousePrecY) * 0.2;
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
        mat4.perspective(this.m_MatP, Utils.radians(12.0), width / height, 0.1, 30.0);
    }


    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra
        mat4.identity(this.m_MatV);

        // éloignement de la scène
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0.0, -1.0, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));

        // dessiner la grille
        this.m_Grid.onDraw(this.m_MatP, this.m_MatV);

        // dessiner le rectangle en arrière
        mat4.translate(this.m_MatTMP, this.m_MatV, vec3.fromValues(0, 0, -1));
        mat4.scale(this.m_MatTMP, this.m_MatTMP, vec3.fromValues(3,3,3));
        this.m_Rectangle.onDraw(this.m_MatP, this.m_MatTMP);

        // dessiner le rocher en avant
        mat4.translate(this.m_MatTMP, this.m_MatV, vec3.fromValues(0, 0, +1));
        mat4.scale(this.m_MatTMP, this.m_MatTMP, vec3.fromValues(0.5, 0.5, 0.5));
        this.m_Rock.onDraw(this.m_MatP, this.m_MatTMP);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Rectangle.destroy();
        this.m_Grid.destroy();
    }
}
