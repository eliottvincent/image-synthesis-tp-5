// Définition de la classe Ground

// superclasses et classes nécessaires
Requires("Mesh");
Requires("MaterialGround");


class Ground extends Mesh
{
    /**
     * Constructeur
     * @param taille du rectangle
     */
    constructor(taille=6.0)
    {
        // créer le matériau (this n'est pas encore défini)
        let matrectangle = new MaterialGround();

        // initialisation de this
        super("Ground", matrectangle);
        this.m_MatRectangle = matrectangle;

        // ajout des sommets
        let P1 = new Vertex(this, -taille, 0.0, -taille).setTexCoords(0.0, taille);
        let P2 = new Vertex(this, -taille, 0.0, +taille).setTexCoords(0.0, 0.0);
        let P3 = new Vertex(this, +taille, 0.0, +taille).setTexCoords(taille, 0.0);
        let P4 = new Vertex(this, +taille, 0.0, -taille).setTexCoords(taille, taille);

        // ajout des triangles
        this.addQuad(P1, P2, P3, P4);

        // le maillage peut être dessiné
        this.setReady();
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_MatRectangle.destroy();
    }
}
