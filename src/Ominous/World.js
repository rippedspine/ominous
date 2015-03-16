'use strict';

import {

    FAR,
    BACKGROUND_COLOR,
    GROUND_COLOR

} from './Constants';

// import CANNON from 'cannon';
import THREE from 'three';

var CANNON = {};
CANNON.World = require('cannon/src/world/World');
CANNON.NaiveBroadphase = require('cannon/src/collision/NaiveBroadphase');

export default class World extends THREE.Scene {

    constructor() {

        super();

        this.fog = new THREE.Fog( BACKGROUND_COLOR, FAR * 0.5, FAR );

        this.physics = new CANNON.World();
        this.physics.springs = [];

        this.physics.gravity.set( 0, 0, 0 );
        this.physics.broadphase = new CANNON.NaiveBroadphase();
        this.physics.solver.iterations = 10;

    }

    add( object ) {

        if ( typeof object.body !== 'undefined' ) {
            this.physics.add( object.body );
        }

        if ( typeof object.glow !== 'undefined' ) {
            super.add( object.glow );
        }

        if ( typeof object.spring !== 'undefined' ) {
            this.physics.add( object.spring.point );
            this.physics.springs.push( object.spring );
        }

        super.add( object );

    }

    update() {

        this.physics.step( 0.01666666666667 );

    }

}
