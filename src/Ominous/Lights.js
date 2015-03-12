'use strict';

import { 

    FAR,
    BACKGROUND_COLOR,
    GROUND_COLOR

} from './Config';

import THREE from 'three';

export class DirectionalLight extends THREE.DirectionalLight {

    constructor(options) {

        super( options.color, options.intensity );

        var d = 200;

        this.position.set( 300, 150, 50 );

        this.castShadow = true;

        this.shadowMapWidth = 1024;
        this.shadowMapHeight = 1024;    

        this.shadowCameraLeft = -d;
        this.shadowCameraRight = d;
        this.shadowCameraTop = d;
        this.shadowCameraBottom = -d;

        this.shadowCameraFar = FAR;
        this.shadowDarkness = 0.5;

    }

}

export class PointLight extends THREE.PointLight {

    constructor( options ) {

        if ( typeof options.position === 'undefined' ) { 
            options.position = { x: 0, y: 0, z: 0 }; 
        }

        super( options.color, options.intensity );

        this.position.x = options.position.x;
        this.position.y = options.position.y;
        this.position.z = options.position.z;

    }

    setPosition( position ) {

        this.position.set( position );

    }

    update( position ) {

        this.position.y = position.y - 55;

    }

}