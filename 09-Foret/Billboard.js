// Définition de la classe Billboard

Requires("Mesh");
Requires("Texture360");
Requires("Texture360Material");


class Billboard extends Mesh
{
    /**
     * crée un billboard : un rectangle portant une texture360
     * @param texture360
     * @param position : vec3 donnant les coordonnées du bas du panneau
     * @param tx : float donnant la taille horizontale
     * @param ty : float donnant la taille verticale
     */
    constructor(texture360, position, tx=1.0, ty=1.0)
    {
        // créer le matériau (this n'est pas encore défini)
        let matbillboard = new Texture360Material(texture360);

        // initialisation de this
        super("Billboard", matbillboard);
        this.m_Material = matbillboard;

        // paramètres
        this.m_Position = position;
        this.m_SizeX = tx;
        this.m_SizeY = ty;

        // matrices pour stocker les ModelView
        this.m_MatVMorig = mat4.create();
        this.m_MatVMfixed = mat4.create();

        // angle sous lequel on voit le billboard
        this.m_Angle = 0.0;
        this.m_Material.setAngle(this.m_Angle);

        // ajout des sommets
        let P1 = new Vertex(this, -0.5, 0.0, 0.0).setTexCoords(0.0, 0.0);
        let P2 = new Vertex(this, +0.5, 0.0, 0.0).setTexCoords(1.0, 0.0);
        let P3 = new Vertex(this, +0.5, 1.0, 0.0).setTexCoords(1.0, 1.0);
        let P4 = new Vertex(this, -0.5, 1.0, 0.0).setTexCoords(0.0, 1.0);

        // ajout des triangles
        this.addQuad(P1, P2, P3, P4);

        // le maillage peut être dessiné
        this.setReady();
    }


    /**
     * dessin du billboard sur l'écran, variante ultra simple
     * @param matP : matrice de projection
     * @param matVM : matrice de vue
     */
    onDrawVerySimple(matP, matVM)
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return;

/// PARTIE 9.2
        // mettre en place le blending
//!//!//! PAS FAIT (à vous de le faire) !

        // dessiner le rectangle face à la caméra
        super.onDraw(matP, matVM);

/// PARTIE 9.2
        // arrêter le blending
//!//!//! PAS FAIT (à vous de le faire) !
     }


    /**
     * dessin du billboard sur l'écran, variante plus simple (pas capable de gérer une forêt)
     * @param matP : matrice de projection
     * @param matVM : matrice de vue
     */
    onDrawSimple(matP, matVM)
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return;

/// PARTIE 9.2
        // mettre en place le blending
//!//!//! PAS FAIT (à vous de le faire) !


        /** dessiner l'ombre */

/// PARTIE 9.5
        // rendre le matériau noir et un peu transparent
        this.m_Material.setCoefficients(0.0, 0.7);
        // activer la texture d'angle 0 pour l'ombre (soleil tjrs même position)
        //!//!//! PAS FAIT (à vous de le faire) !
        // désactiver le z-buffer
        //!//!//! PAS FAIT (à vous de le faire) !
        // faire pivoter le billboard à plat par terre
        //!//!//! PAS FAIT (à vous de le faire) !
        // réduire la hauteur du billboard à 70%, en tenant compte de m_SizeX et m_SizeY
        //!//!//! PAS FAIT (à vous de le faire) !
        // dessiner le billboard
        //!//!//! PAS FAIT (à vous de le faire) !
        // réactiver le test du depth buffer
        //!//!//! PAS FAIT (à vous de le faire) !
        // rendre le matériau normal
        this.m_Material.setCoefficients(1.0, 1.0);


        /** dessiner le billboard */

/// PARTIE 9.3
        // modifier la matrice matVM pour annuler toute rotation
        let matVMfixed = mat4.clone(matVM);
        // mettre des 0 et des 1 au bon endroit
        // ah oui, il faut aussi tenir compte de la taille du billboard, this.m_SizeX et this.m_SizeY
//!//!//! PAS FAIT (à vous de le faire) !

/// PARTIE 9.4
        // déterminer l'angle de vue et choisir l'image
        let cosinus = 1.0;
        let sinus = 0.0;
//!//!//! PAS FAIT (à vous de le faire) !
        let angle = Math.atan2(sinus, cosinus);
        // mise de l'angle dans la plage [0, 1[
        angle = angle/(2*Math.PI) + 1.0;
        angle = angle - Math.floor(angle);
        this.m_Material.setAngle(angle);

        // dessiner le rectangle face à la caméra
        super.onDraw(matP, matVMfixed);

/// PARTIE 9.2
        // arrêter le blending
//!//!//! PAS FAIT (à vous de le faire) !
     }


    /**
     * dessin du billboard sur l'écran, variante normale (gestion multiples billboards)
     * @param matP : matrice de projection perpective
     * @param matVM : matrice de transformation de l'objet par rapport à la caméra (on n'en tient pas compte)
     */
    onDraw(matP, matVM)
    {
        // ne rien faire s'il n'est pas prêt
        if (!this.m_Ready) return;

/// PARTIE 9.2
        // mettre en place le blending
//!//!//! PAS FAIT (à vous de le faire) !

        /** dessiner l'ombre */

/// PARTIE 9.5
        // rendre le matériau noir et un peu transparent
        this.m_Material.setCoefficients(0.0, 0.7);
        // activer la texture d'angle 0 pour l'ombre (soleil tjrs même position)
        //!//!//! PAS FAIT (à vous de le faire) !
        // désactiver le z-buffer
        //!//!//! PAS FAIT (à vous de le faire) !
        // faire pivoter le billboard à plat par terre
        //!//!//! PAS FAIT (à vous de le faire) !
        // réduire la hauteur du billboard à 70%, en tenant compte de m_SizeX et m_SizeY
        //!//!//! PAS FAIT (à vous de le faire) !
        // dessiner le billboard
        //!//!//! PAS FAIT (à vous de le faire) !
        // réactiver le test du depth buffer
        //!//!//! PAS FAIT (à vous de le faire) !
        // rendre le matériau normal
        this.m_Material.setCoefficients(1.0, 1.0);

        /** dessiner le billboard */

        // activer la bonne texture
        this.m_Material.setAngle(this.m_Angle);
        // dessiner le rectangle face à la caméra
        super.onDraw(matP, this.m_MatVMfixed);

/// PARTIE 9.2
        // arrêter le blending
//!//!//! PAS FAIT (à vous de le faire) !
    }


    /**
     * recopie ModelView dans les matrices locales
     * @param matVM
     */
    setModelView(matVM)
    {
        // d'abord placer le billboard à sa place
        mat4.translate(this.m_MatVMorig, matVM, this.m_Position);

        // copier la matrice finale obtenue : elle positionne ce billboard par rapport à la caméra, mais on va la modifier
        mat4.copy(this.m_MatVMfixed, this.m_MatVMorig);

/// PARTIE 9.6
        // la distance est dans modelview.translation.z
        this.m_Distance = 15.0;
//!//!//! PAS FAIT (à vous de le faire) !

/// PARTIE 9.4
        // déterminer l'angle de vue et choisir l'image
        let cosinus = 1.0;
        let sinus = 0.0;
//!//!//! PAS FAIT (à vous de le faire) !
        let angle = Math.atan2(sinus, cosinus);
        // mise de l'angle dans la plage [0, 1[
        angle = angle/(2*Math.PI) + 1.0;
        this.m_Angle = angle - Math.floor(angle);

        /** variante : le billboard est strictement face à la caméra **/

        // modifier la matrice this.m_MatVMfixed afin qu'il n'y ait plus aucune rotation
        // mais appliquer une mise à l'échelle

        /** variante : le billboard reste vertical, mais tourné vers la caméra **/

        // modifier la matrice this.m_MatVMfixed afin qu'il n'y ait plus aucune rotation en Y
        // mais appliquer une mise à l'échelle
    }


    /**
     * retourne la distance du billboard à l'œil
     * @return distance
     */
    getDistance()
    {
        return this.m_Distance;
    }


    /**
     * compare la distance entre deux billboard afin de pouvoir classer une liste
     * du plus loin au plus proche
     * @param a : billboard à comparer
     * @param b : billboard à comparer
     * @return la valeur qu'il faut pour le tri
     */
    DistanceCompare(a, b)
    {
        return a.m_Distance > b.m_Distance;
    }

    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_Material.destroy();
    }
}
