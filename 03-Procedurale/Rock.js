// Définition de la classe Rock

Requires("Mesh");
Requires("MaterialProc");


class Rock extends Mesh
{
    /** constructeur */
    constructor()
    {
        // créer le matériau (this n'est pas encore défini)
        let matrock  = new MaterialProc();

        // initialisation de this
        super("Rock", matrock);
        this.m_MatRock = matrock;

        // lire le fichier obj
        this.loadObj("data/rock.obj", this.onRockLoaded);
    }


    /** appelée quand le maillage est chargé */
    onRockLoaded()
    {
        // recopier la méthode du projet 02-Mapping
    }


    /**
     * supprime toutes les ressources allouées dans le constructeur
     */
    destroy()
    {
        // méthode de la superclasse (suppression des VBOs)
        super.destroy();

        // supprimer le matériau
        this.m_MatRock.destroy();
    }
}
