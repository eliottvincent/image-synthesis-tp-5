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
        let material = new MaterialGround();

        // initialisation de this
        super("Ground", material);
        this.m_Material = material;

        // ajout des sommets
        let P1 = new Vertex(this, -8.0, 0.0, +8.0).setTexCoords(0.0, 0.0).setNormal(0.0, 1.0, 0.0);
        let P2 = new Vertex(this, +8.0, 0.0, +8.0).setTexCoords(8.0, 0.0).setNormal(0.0, 1.0, 0.0);
        let P3 = new Vertex(this, +8.0, 0.0, -8.0).setTexCoords(8.0, 8.0).setNormal(0.0, 1.0, 0.0);
        let P4 = new Vertex(this, -8.0, 0.0, -8.0).setTexCoords(0.0, 8.0).setNormal(0.0, 1.0, 0.0);

        // ajout des triangles
        this.addQuad(P1, P2, P3, P4);

        // le maillage peut être dessiné
        this.setReady();
    }


    /**
     * définit la lampe
     * @param light : instance de Light spécifiant les caractéristiques de la lampe
     */
    setLight(light)
    {
        this.m_Material.setLight(light);
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
