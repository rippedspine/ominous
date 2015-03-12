'use strict';

import {

    BACKGROUND_COLOR,
    SCREEN_WIDTH,
    SCREEN_HEIGHT

} from './Config';

import fit from 'canvas-fit';

import THREE from 'three';

export default class WebGLRenderer extends THREE.WebGLRenderer {

    constructor() {

        super({ antialias: true });

        this.setClearColor( BACKGROUND_COLOR );
        this.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        this.shadowMapEnabled = true;
        this.shadowMapSoft = true;

        fit( this.domElement );

        document.body.appendChild( this.domElement );

        this.bindDOMEvents();

    }

    bindDOMEvents() {

        window.addEventListener( 'resize', this.handleResize.bind(this) );

    }

    handleResize() {

        fit( this.domElement );

        this.setSize( window.innerWidth, window.innerHeight );

    }

}
