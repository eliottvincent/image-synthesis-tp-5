// Définition de la classe Light

// superclasses et classes nécessaires
Requires("Light");
Requires("FrameBufferObject");


class ShadowLight extends Light
{
    /**
     * constructeur : initialise une lampe, utiliser les setters pour la définir
     */
    constructor(size)
    {
        // c'est une lampe
        super();

        // shadow map = FBO contenant seulement un depth buffer
        this.m_ShadowMap = new FrameBufferObject(size, size, gl.NONE, gl.TEXTURE_2D);

        // distances de vue à ajuster en fonction de la distance et la taille de la zone éclairée
        this.m_Near = 3.0;
        this.m_Far = 20.0;

        // matrices intermédiaires
        this.m_MatLightProjection = mat4.create();
        this.m_MatLightView = mat4.create();
        this.m_ShadowMatrix = mat4.create();
        this.m_TargetCamera = vec3.create();
    }


    /**
     * dessine la scène dans la shadowmap de cette lampe
     * @param scene à dessiner vue de la lampe this
     * @param matViewCamera : matrice amenant les coordonnées dans le repère caméra
     */
    drawShadowMap(scene, matViewCamera)
    {
        // s'il n'y a pas de shadowmap, alors sortir sans rien faire
        if (this.m_ShadowMap == null) return;

        // construire une matrice de projection perspective à partir de la lampe
        mat4.perspective(this.m_MatLightProjection, Utils.radians(this.m_MaxAngle)*2.0, 1.0, this.m_Near, this.m_Far);

        // construire une matrice de vue à partir de la lampe
        vec3.add(this.m_TargetCamera, this.m_PositionCamera, this.m_DirectionCamera);
        mat4.lookAt(this.m_MatLightView, this.m_PositionCamera, this.m_TargetCamera, vec3.fromValues(0,1,0));

        // appliquer la matrice de la scène
        mat4.multiply(this.m_MatLightView, this.m_MatLightView, matViewCamera);

        // calculer la matrice d'ombre
        mat4.invert(this.m_ShadowMatrix, matViewCamera);
        mat4.multiply(this.m_ShadowMatrix,this.m_MatLightView, this.m_ShadowMatrix);
        mat4.multiply(this.m_ShadowMatrix,this.m_MatLightProjection, this.m_ShadowMatrix);
        let MatBias = mat4.create();
        mat4.translate(MatBias, MatBias,vec3.fromValues(0.5, 0.5, 0.5));
        mat4.scale(MatBias, MatBias, vec3.fromValues(0.5, 0.5, 0.5));

        mat4.multiply(this.m_ShadowMatrix, MatBias, this.m_ShadowMatrix);

        // passer en mode dessin dans la shadowmap
        this.m_ShadowMap.enable();

        // corriger le défaut "acné de surface"
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);

        // corriger le défaut "murs volants" (l'ombre se détache des pieds de la vache)
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);

        // dessiner la scène
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        scene.onDraw(this.m_MatLightProjection, this.m_MatLightView);

        // remettre les modes de dessin à la normale
        gl.cullFace(gl.BACK);
        gl.polygonOffset(0.0, 0.0);
        gl.disable(gl.POLYGON_OFFSET_FILL);

        // revenir en mode dessin normal
        this.m_ShadowMap.disable();

        // debug : dessiner le depth buffer dans le viewport (côté droit)
        this.m_ShadowMap.onDrawDepth();
    }


    destroy()
    {
        this.m_ShadowMap.destroy();
    }
}


/** initialise la matrice de biais */
ShadowLight.c_MatBias = mat4.create();
mat4.translate(ShadowLight.c_MatBias, ShadowLight.c_MatBias, vec3.fromValues(0.5, 0.5, 0.5));
mat4.scale(    ShadowLight.c_MatBias, ShadowLight.c_MatBias, vec3.fromValues(0.5, 0.5, 0.5));
