// Définition de la classe Ground

// superclasses et classes nécessaires
Requires("Mesh");
Requires("MaterialGround");


class Ground extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let matground = new MaterialGround();

        // initialisation de this
        super("Ground", matground);
        this.m_MatGround = matground;

        // ajout des sommets
        let P1 = new Vertex(this, -100.0, 0.0, +100.0).setTexCoords(  0.0,   0.0);
        let P2 = new Vertex(this, +100.0, 0.0, +100.0).setTexCoords(200.0,   0.0);
        let P3 = new Vertex(this, +100.0, 0.0, -100.0).setTexCoords(200.0, 200.0);
        let P4 = new Vertex(this, -100.0, 0.0, -100.0).setTexCoords(  0.0, 200.0);

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
        this.m_MatGround.destroy();
    }
}
