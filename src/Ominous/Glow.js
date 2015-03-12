'use strict';

import THREE from 'three';
import glowShader from '../Shaders/Glow';

export default class Glow extends THREE.Mesh {

    constructor( options ) {

        glowShader.uniforms.glowColor.value = new THREE.Color( options.color );
        glowShader.uniforms.viewVector.value = options.viewVector;
        glowShader.uniforms.c.value = 0;
        glowShader.uniforms.p.value = 1;

        super(
            options.geometry.clone(),
            new THREE.ShaderMaterial( glowShader )
        );

        this.position.x = options.position.x;
        this.position.y = options.position.y;
        this.position.z = options.position.z;

        this.scale.multiplyScalar( 1.2 );

    }

    update( camera, mesh ) {

        var viewVectorValue = new THREE.Vector3();

        this.position.copy( mesh.position );
        this.quaternion.copy( mesh.quaternion );

        viewVectorValue.subVectors(
            camera.position,
            this.position
        );

        this.material.uniforms.viewVector.value = viewVectorValue;

    }

}
