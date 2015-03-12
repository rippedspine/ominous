'use strict';

import {

    VIEW_ANGLE,
    NEAR,
    FAR

} from './Config';

import THREE from 'three';

import { cosine } from '../Lib/interpolation';

var cos = Math.cos;
var sin = Math.sin;
var DateNow = Date.now;

export default class PerspectiveCamera extends THREE.PerspectiveCamera {

    constructor( options ) {

        options = (typeof options !== 'undefined') ? options : { position: {} };

        super( VIEW_ANGLE, window.innerWidth / window.innerHeight, NEAR, FAR );

        this._originY = options.position.y || 15;

        this.position.x = options.position.x || 45;
        this.position.y = this._originY;
        this.position.z = options.position.z || 90;

        this._mouseY = 0;

        this._interpolatePoints = [
            this._originY,
            this._originY
        ];

        this._previousNow = DateNow();

        this._time = 0;
        this._timeDivider = options.timeDivider || 100;
        this._multiplier = options.multiplier || 50;

        this._bindDOMEvents();

    }

    _bindDOMEvents() {

        window.addEventListener( 'resize', this._handleResize.bind(this) );
        document.addEventListener( 'mousemove', this._onDocumentMouseMove.bind(this), false );
        document.addEventListener( 'touchmove', this._onDocumentTouchMove.bind(this), false );

    }

    _getPositionY() {

        var t = this._time / this._timeDivider;
        var mouseY = this._mouseY;

        var posY = this.position.y;
        var originY = this._originY;
        var multiplier = this._multiplier;
        var ips = this._interpolatePoints;
        var divider = this._divider * 100;

        if ( t > 1 ) {

            this._time %= this._timeDivider;
            t = this._time / this._timeDivider;

            ips.shift();

            if ( this._mousePositionChanged ) {

                ips.push( mouseY / multiplier );

            } else {

                ips.push( originY );

            }

            this._mousePositionChanged = false;

        }

        return cosine( ips[0], ips[1], t );
    }

    _onDocumentMouseMove( event ) {

        this._mouseY = -( event.clientY - window.innerHeight );
        this._mousePositionChanged = true;

    }

    _onDocumentTouchMove( event ) {

        if ( event.touches && event.touches.length > 0 ) {
            this._onDocumentMouseMove( event.touches[0] );
        }

    }

    update() {

        var timer = DateNow() * 0.0002;

        this.position.x = cos( timer ) * 100;
        this.position.y = this._getPositionY();
        this.position.z = sin( timer ) * 100;

        var t = DateNow();
        this._time += (t - this._previousNow) / 30;
        this._previousNow = t;

    }

    _handleResize() {

        this.aspect = window.innerWidth / window.innerHeight;
        this.updateProjectionMatrix();

    }

}
