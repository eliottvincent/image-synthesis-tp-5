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

        // matrices
        this.m_MatV = mat4.create();
        this.m_MatVM = mat4.create();
    }


    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);

        // matrice de projection parallèle
        this.m_MatP = mat4.create();
        mat4.identity(this.m_MatP);

        // pas de transformation caméra
        mat4.identity(this.m_MatV);
    }


    /** dessine scène 1 en plein écran, on peut lui appliquer des effets */
    onDrawFrame()
    {
        // dessiner la scène 1 dans le FBO
        this.m_FBOscene1.enable();
        this.m_Scene1.onDrawFrame();
        this.m_FBOscene1.disable();
        //this.m_FBOscene1.onDraw(); return;

        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // dessiner le rectangle
        this.m_Rectangle.onDraw(this.m_MatP, this.m_MatV);
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
