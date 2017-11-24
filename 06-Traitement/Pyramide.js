// Définition de la classe Pyramide

Requires("Mesh");
Requires("MaterialPyramide");


class Pyramide extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let matpyramide = new MaterialPyramide();

        // initialisation de this
        super("Pyramide", matpyramide);
        this.m_MatGround = matpyramide;

        /** maillage */

        // sommets
        let v0 = new Vertex(this,  0.0, 4.0,  0.0).setColor(0.2,  0.6,  0.2);
        let v1 = new Vertex(this,  1.0, 0.0,  0.0).setColor(0.1,  0.45, 0.15);
        let v2 = new Vertex(this,  0.0, 0.0, -1.0).setColor(0.15, 0.5,  0.1);
        let v3 = new Vertex(this, -1.0, 0.0,  0.0).setColor(0.1,  0.4,  0.15);
        let v4 = new Vertex(this,  0.0, 0.0,  1.0).setColor(0.15, 0.5,  0.1);

        // triangles
        new Triangle(this, v0, v1, v2);
        new Triangle(this, v0, v2, v3);
        new Triangle(this, v0, v3, v4);
        new Triangle(this, v0, v4, v1);
        new Triangle(this, v4, v3, v2);
        new Triangle(this, v2, v1, v4);

        this.setReady();
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        super.destroy();

        // supprimer le matériau
        this.m_MatGround.destroy();
    }
}
