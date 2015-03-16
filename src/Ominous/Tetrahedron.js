'use strict';

import THREE from 'three';
import Glow from './Glow';

var CANNON = {};
CANNON.Body = require('cannon/src/objects/Body');
CANNON.Vec3 = require('cannon/src/math/Vec3');

var DateNow = Date.now;
var cos = Math.cos;

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

        this._body = new Body( 70 );

        this.glow = new Glow({

            color: options.color,
            position: this._body.position,
            viewVector: options.viewVector,
            geometry: geometry

        });

        this._raycaster = new THREE.Raycaster();
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

        var raycaster = this._raycaster;
        var body = this._body;

        body.update( this );
        this.glow.update( camera, body );

        raycaster.setFromCamera( this._mouse, camera );

        if ( raycaster.intersectObject( this ).length ) {

            body.angularVelocity.set( 0, 5, 0 );

        }

    }

}

class Body extends CANNON.Body {

    constructor( posY ) {

        this.orgY = posY;

        super({
            mass: 0.3,
            position: new CANNON.Vec3( 0, this.orgY, 0 )
        });

        this.angularDamping = 0.5;

    }

    update( mesh ) {

        var timer = DateNow() * 0.002;

        this.position.y = (cos( timer ) * 5) + this.orgY;

        mesh.position.copy( this.position );
        mesh.quaternion.copy( this.quaternion );

    }

}
