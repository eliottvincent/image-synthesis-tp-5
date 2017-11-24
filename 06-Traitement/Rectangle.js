// Définition de la classe Rectangle

// superclasses et classes nécessaires
Requires("Mesh");
Requires("MaterialRectangle");


class Rectangle extends Mesh
{
    /** constructeur */
    constructor(matrectangle)
    {
        // initialisation de this
        super("Rectangle", matrectangle);

        // ajout des sommets
        let P1 = new Vertex(this, -1.0, -1.0, 0.0).setTexCoords(0.0, 0.0);
        let P2 = new Vertex(this, +1.0, -1.0, 0.0).setTexCoords(1.0, 0.0);
        let P3 = new Vertex(this, +1.0, +1.0, 0.0).setTexCoords(1.0, 1.0);
        let P4 = new Vertex(this, -1.0, +1.0, 0.0).setTexCoords(0.0, 1.0);

        // ajout des triangles
        this.addQuad(P1, P2, P3, P4);

        // le maillage peut être dessiné
        this.setReady();
    }
}
