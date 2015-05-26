'use strict';

import CANNON from 'cannon';
import THREE from 'three';
import Glow from './Glow';

var now = Date.now;
var cos = Math.cos;
var random = Math.random;

export default class Tetrahedron extends THREE.Mesh {

    constructor( options ) {

        var geometry = new THREE.TetrahedronGeometry( options.size );
        var material = new THREE.MeshLambertMaterial( options );

        geometry.applyMatrix(
            new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3( 1, 0, 1 ).normalize(),
                Math.atan( Math.sqrt(2) )
            )
        );

        material.shading = THREE.FlatShading;

        super( geometry, material );

        this.body = new Body(new CANNON.Vec3(0, 70, 0));

        this.glow = new Glow({

            color: options.color,
            position: this.body.position,
            viewVector: options.viewVector,
            geometry: geometry

        });

        this._play = options.play || false;
        this._previousNow = now();
        this._time = 0;
        this._timeDivider = 30;

        this.raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();

        this._bindEvents();

    }

    _bindEvents() {

        window.addEventListener( 'mousemove', this._handleMouseMove.bind(this) );
        window.addEventListener( 'touchmove', this._handleTouchMove.bind(this) );

    }

    _handleMouseMove( event ) {

        this._mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this._mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }

    _handleTouchMove( event ) {

        if ( event.touches && event.touches.length > 0 ) {
            this._handleMouseMove( event.touches[0] );
        }

    }

    update( camera ) {

        var t = now();
        this._time += (t - this._previousNow) / this._timeDivider;
        this._previousNow = t;

        var c = this._time / this._timeDivider;

        var raycaster = this.raycaster;
        var body = this.body;

        body.update( this );
        this.glow.update( camera, body );

        raycaster.setFromCamera( this._mouse, camera );

        if ( raycaster.intersectObject( this ).length ) {

            body.angularVelocity.set( 0, 5, 0 );

        }

        if ( (random() * 0.1) * c > 1 && this._play ) {

            this._time %= this._timeDivider;
            t = this._time / this._timeDivider;

            body.angularVelocity.set( 0, 5, 0 );
        }

    }

}

class Body extends CANNON.Body {

    constructor( origin ) {

        this.origin = origin;

        super({
            mass: 0.3,
            position: origin
        });

        this.angularDamping = 0.5;

    }

    update( mesh ) {

        var timer = now() * 0.002;

        this.position.y = (cos( timer ) * 5) + this.origin.y;

        mesh.position.copy( this.position );
        mesh.quaternion.copy( this.quaternion );

    }

}
