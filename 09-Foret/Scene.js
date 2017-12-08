// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("Texture360");
Requires("Billboard");
Requires("Ground");


class Scene
{
    /** constructeur */
    constructor()
    {
        // crée les objets à dessiner
        this.m_Ground = new Ground();

        // créer un billboard isolé en -0.5, 0.0, 2.0 et taille double
        this.m_TxArbre1 = new Texture360("data/textures/arbres/bb_arbre2_8.png", 1);
        this.m_BbArbre1 = new Billboard(this.m_TxArbre1, vec3.fromValues(-0.5, 0.0, 2.0),  5.0, 5.0);

        // créer un second billboard avec 6 images pour 360° isolé en 3.5, 0.0, -2.0 et taille double
        this.m_TxChiffre = new Texture360("data/textures/chiffres/bb_chiffre", 6);
        this.m_BbChiffre = new Billboard(this.m_TxChiffre, vec3.fromValues(3.5, 0.0, -2.0),  2.0, 2.0);

        // créer un ensemble de billboards
        this.m_TxTree = new Texture360("data/textures/arbres/bb_arbre2", 8);
        this.m_Forest = [];
        let N = 13;
        for (let l=0; l<N; l++) {
            for (let c=0; c<N; c++) {
                // générer une taille variant de 20% autour de 1.0
                let sx = 0.8 + Math.random()*0.4;
                let sy = 0.8 + Math.random()*0.4;

                // la position de l'arbre varie un peu autour de (x=c, y=0, z=l)
                let x = c*(9.0/(N-1)) - 4.5  + (Math.random()-0.5)*0.003;
                let y = 0.0;
                let z = l*(9.0/(N-1)) - 4.5 +  (Math.random()-0.5)*0.003;

                // créer et mémoriser un billboard à cet emplacement
                let tree = new Billboard(this.m_TxTree, vec3.fromValues(x,y,z), sx, sy);

                // ajouter ce nouvel arbre dans la forêt
                this.m_Forest.push(tree);
            }
        }

        // configurer les modes de dessin
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);      // laisser voir le dos des billboards

        // formule de blending
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // couleur du fond
        gl.clearColor(0.6, 0.7, 1.0, 0.0);

        // gestion souris
        this.m_Azimut    = 30.0;
        this.m_Elevation = 20.0;
        this.m_Distance  = 10.0;
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
        mat4.perspective(this.m_MatP, Utils.radians(50.0), width / height, 0.1, 80.0);
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

        // dessiner le terrain
        this.m_Ground.onDraw(this.m_MatP, this.m_MatV);


        /// PARTIES 9.2 et 9.3 à commenter dès que ça marche
        // this.m_BbArbre1.onDrawVerySimple(this.m_MatP, this.m_MatV);
        // this.m_BbArbre1.onDrawSimple(this.m_MatP, this.m_MatV);

        /// PARTIE 9.4 : décommentez ces deux lignes, et commentez celles de l'arbre ci-dessus
        // this.m_BbChiffre.onDrawSimple(this.m_MatP, this.m_MatV);

        // autre possibilité, pour utiliser la partie 9.6
        // this.m_BbChiffre.setModelView(this.m_MatV);
        // this.m_BbChiffre.onDrawSimple(this.m_MatP, this.m_MatV);

        // this.m_BbArbre1.setModelView(this.m_MatV);
        // this.m_BbArbre1.onDraw(this.m_MatP);

        // PARTIE 9.6 : décommentez toutes ces lignes, et commentez celles de l'arbre et du chiffre ci-dessus
        // positionner chaque arbre
        for (let tree of this.m_Forest) {
            // positionner l'arbre => récupérer sa matrice ModelView pour avoir sa distance
            tree.setModelView(this.m_MatV);
        }

        // classer par distance décroissante à l'oeil
       this.m_Forest.sort(Billboard.prototype.DistanceCompare);

        // dessiner l'ensemble des arbres
        for (let tree of this.m_Forest) {
            tree.onDraw(this.m_MatP);
        }
    }


    /** supprime tous les objets de cette scène, ordre inverse de la création */
    destroy()
    {
        this.m_Ground.destroy();
        for (let tree of this.m_Forest) {
            tree.destroy();
        }
        this.m_TxTree.destroy();

        this.m_BbChiffre.destroy();
        this.m_TxChiffre.destroy();

        this.m_BbArbre1.destroy();
        this.m_TxArbre1.destroy();

        super.destroy();
    }
}
