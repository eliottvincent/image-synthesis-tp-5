// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Ground");
Requires("Cow");
Requires("Apple");


class Scene
{
    /** constructeur */
    constructor()
    {
        // créer la shadow map
        //this.m_FBOscene1 = new FrameBufferObject(1024, 768);

        // créer les objets à dessiner
        this.m_Ground = new Ground();
        this.m_Cow = new Cow();
        this.m_Apple = new Apple();
        this.m_Star = new Star(0.3, 4.0);

        // définition de la lampe spot avec ombre
        this.m_Light = new ShadowLight(1024);
        this.m_Light.setColor(20.0, 20.0, 20.0);
        this.m_Light.setPosition(-4.0,  5.0,  0.0, 1.0);
        this.m_Light.setDirection(1.0, -1.5, 0.0, 0.0);
        this.m_Light.setAngles(30.0, 40.0);

        // fournir la lampe aux matériaux pour initialisation
        this.m_Ground.setLight(this.m_Light);
        this.m_Cow.setLight(this.m_Light);
        this.m_Apple.setLight(this.m_Light);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // gestion souris
        this.m_Azimut    = 40.0;
        this.m_Elevation = 30.0;
        this.m_Distance  = 15.0;
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
        this.m_ViewPortWidth = width/2;
        this.m_ViewPortHeight = height;

        // matrice de projection
        this.m_MatP = mat4.create();
        mat4.perspective(this.m_MatP,
            Utils.radians(18.0),                            // angle de champ
            this.m_ViewPortWidth / this.m_ViewPortHeight,   // étirement des pixels
            0.01, 100.0);                                   // near et far
    }


    /**
     * dessine les objets de la scène dans la transformation spécifiée par les matrices
     * @param matP : matrice de projection (caméra -> cube unitaire)
     * @param matV : matrice de changement de repère scène -> caméra
     */
    onDraw(matP, matV)
    {
        // dessiner le sol
        this.m_Ground.onDraw(matP, matV);

        // dessiner la vache en la réduisant à 20% de sa taille
        mat4.translate(this.m_MatVM, matV, vec3.fromValues(1.0, 0.0, 0.0));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.2, 0.2, 0.2));
        this.m_Cow.onDraw(matP, this.m_MatVM);

        // dessiner la pomme normale en réduisant sa taille
        mat4.translate(this.m_MatVM, matV, vec3.fromValues(-1.0, 0.0, -1.0));
        mat4.scale(this.m_MatVM, this.m_MatVM, vec3.fromValues(0.03, 0.03, 0.03));
        this.m_Apple.onDraw(matP, this.m_MatVM);
    }


    /**
     * dessine la scène, avec les lampes et les objets
     */
    onDrawFrame()
    {
        // effacer l'écran en gris très sombre
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra
        mat4.identity(this.m_MatV);

        // éloignement de la scène
        mat4.translate(this.m_MatV, this.m_MatV, vec3.fromValues(0.0, -0.7, -this.m_Distance));

        // rotation demandée par la souris
        mat4.rotateX(this.m_MatV, this.m_MatV, Utils.radians(this.m_Elevation));
        mat4.rotateY(this.m_MatV, this.m_MatV, Utils.radians(this.m_Azimut));

        // calculer la position et la direction de la lampe par rapport à la scène
        this.m_Light.transform(this.m_MatV);

        // désactiver les lampes le temps de dessiner la shadow map
        this.m_Ground.setLight(null);
        this.m_Cow.setLight(null);
        this.m_Apple.setLight(null);

        // dessiner la shadow map de la lampe et la recopier à droite
        gl.viewport(this.m_ViewPortWidth, 0, this.m_ViewPortWidth, this.m_ViewPortHeight);
        this.m_Light.drawShadowMap(this, this.m_MatV);

        // spécifier la lampe aux objets qui les enverront à leurs matériaux
        this.m_Ground.setLight(this.m_Light);
        this.m_Cow.setLight(this.m_Light);
        this.m_Apple.setLight(this.m_Light);

        // zone de dessin : côté gauche
        gl.viewport(0, 0, this.m_ViewPortWidth, this.m_ViewPortHeight);

        // dessiner une étoile là où est la lampe spot
        mat4.translate(this.m_MatVM, this.m_MatV, this.m_Light.m_PositionScene);
        this.m_Star.onDraw(this.m_MatP, this.m_MatVM);

        // dessiner les objets vus de la caméra
        this.onDraw(this.m_MatP, this.m_MatV);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_Apple.destroy();
        this.m_Cow.destroy();
        this.m_Ground.destroy();
        this.m_Star.destroy();
        this.m_Light.destroy();
    }
}
