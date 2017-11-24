// Définition de la classe Cow

Requires("Mesh");
Requires("MaterialCow");


class Cow extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let material  = new MaterialCow();

        // initialisation de this
        super("Cow", material);
        this.m_Material = material;

        // lire le fichier obj
        this.loadObj("data/cow.obj", this.onCowLoaded);
    }


    /**
     * cette méthode est appelée quand le fichier OBJ est chargé
     */
    onCowLoaded()
    {
        // calculer les normales du maillage car celui de la vache ne contient pas de normales
        this.computeNormals();
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
