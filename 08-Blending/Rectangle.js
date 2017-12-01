// Définition de la classe Rectangle

// superclasses et classes nécessaires
Requires("Mesh");
Requires("MaterialRectangle");


class Rectangle extends Mesh
{
    /**
     * Constructeur
     * @param nomimage : nom complet du fichier à charger
     * @param width : largeur du rectangle
     * @param height : hauteur du rectangle
     */
    constructor(nomimage, width, height)
    {
        // créer le matériau (this n'est pas encore défini)
        let matrectangle = new MaterialRectangle(nomimage);

        // initialisation de this
        super("Rectangle", matrectangle);
        this.m_MatRectangle = matrectangle;

        // ajout des sommets
        let P1 = new Vertex(this, -width, -height,  0.0).setTexCoords(0.0, 0.0);
        let P2 = new Vertex(this, +width, -height,  0.0).setTexCoords(1.0, 0.0);
        let P3 = new Vertex(this, +width, +height,  0.0).setTexCoords(1.0, 1.0);
        let P4 = new Vertex(this, -width, +height,  0.0).setTexCoords(0.0, 1.0);

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
