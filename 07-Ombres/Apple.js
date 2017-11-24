// Définition de la classe Apple

Requires("Mesh");
Requires("MaterialApple");


class Apple extends Mesh
{
    /** constructeur */
    constructor()
    {
        // matériau
        let material = new MaterialApple();

        // initialisation de this
        super("Apple", material);
        this.m_Material = material;

        // lire le fichier obj
        this.loadObj("data/Apple/apple.obj");
        // il n'y a pas de callback, car le fichier obj contient les normales et coordonnées de texture
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
