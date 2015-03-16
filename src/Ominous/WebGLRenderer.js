'use strict';

import {

    BACKGROUND_COLOR

} from './Constants';

import THREE from 'three';

export default class WebGLRenderer extends THREE.WebGLRenderer {

    constructor() {

        super({ antialias: true });

        this.setClearColor( BACKGROUND_COLOR );
        this.setSize( window.innerWidth, window.innerHeight );

        this.shadowMapEnabled = true;
        this.shadowMapSoft = true;

        var style = this.domElement.style;
        style.position = 'fixed';
        style.left = style.top = 0;
        style.width = style.height = '100%';

        document.body.appendChild( this.domElement );

        this._bindDOMEvents();

    }

    _bindDOMEvents() {

        window.addEventListener( 'resize', this._handleResize.bind(this) );

    }

    _handleResize() {

        this.setSize( window.innerWidth, window.innerHeight );

    }

}
