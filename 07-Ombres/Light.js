// Définition de la classe Light

// superclasses et classes nécessaires
Requires("FrameBufferObject");


class Light
{
    /**
     * constructeur : initialise une lampe, utiliser les setters pour la définir
     */
    constructor()
    {
        // couleur et position
        this.m_Color          = vec3.create();
        this.m_PositionScene  = vec4.create();
        this.m_DirectionScene = vec4.create();

        // angles d'ouverture
        this.m_MinAngle = 20.0;
        this.m_MaxAngle = 30.0;

        // position et direction de la lampe relativement à la caméra
        this.m_PositionCamera  = vec4.create();
        this.m_DirectionCamera = vec4.create();
    }


    /**
     * définit la couleur de la lampe, c'est à dire l'intensité
     */
    setColor(r,g,b)
    {
        vec3.set(this.m_Color, r,g,b);
        return this;
    }


    /**
     * retourne la couleur de la lampe
     * @return vec3 couleur
     */
    getColor()
    {
        return this.m_Color;
    }

    /**
     * définit la position de la lampe par rapport à la scène
     */
    setPosition(x,y,z,w)
    {
        vec4.set(this.m_PositionScene, x,y,z,w);
        return this;
    }


    /**
     * retourne la position de la lampe par rapport à la caméra
     * @return vec4 position caméra
     */
    getPosition()
    {
        return this.m_PositionCamera;
    }


    /**
     * définit la couleur de la lampe, c'est à dire l'intensité
     * @param color : vec3 donnant la couleur
     */
    setDirection(x,y,z,w)
    {
        vec4.set(this.m_DirectionScene, x,y,z,w);
        return this;
    }


    /**
     * retourne la direction de la lampe par rapport à la caméra
     * @return vec4 direction caméra
     */
    getDirection()
    {
        return this.m_DirectionCamera;
    }


    /**
     * calcule la position et la direction en coordonnées caméra
     * @param matV : mat4 matrice de vue caméra
     */
    transform(matV)
    {
        vec4.transformMat4(this.m_PositionCamera,  this.m_PositionScene,  matV);
        vec4.transformMat4(this.m_DirectionCamera, this.m_DirectionScene, matV);
        vec4.normalize(this.m_DirectionCamera, this.m_DirectionCamera);
    }


    /**
     * définit la couleur de la lampe, c'est à dire l'intensité
     * @param color : vec3 donnant la couleur
     */
    setAngles(minangle, maxangle)
    {
        this.m_MinAngle = minangle;
        this.m_MaxAngle = maxangle;
        return this;
    }


    /**
     * retourne le cosinus de l'angle de pleine lumière
     * @return float cos(minangle)
     */
    getCosMinAngle()
    {
        return Math.cos(Utils.radians(this.m_MinAngle));
    }


    /**
     * retourne le cosinus de l'angle d'extinction
     * @return float cos(maxangle)
     */
    getCosMaxAngle()
    {
        return Math.cos(Utils.radians(this.m_MaxAngle));
    }
}
