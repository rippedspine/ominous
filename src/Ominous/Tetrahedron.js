'use strict';

import CANNON from 'cannon';
import THREE from 'three';
import Glow from './Glow';

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

        this.body = new Body( 70 );

        this.glow = new Glow({

            color: options.color,
            position: this.body.position,
            viewVector: options.viewVector,
            geometry: geometry

        });

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.bindEvents();

    }

    bindEvents() {

        window.addEventListener( 'mousemove', this.handleMouseMove.bind(this) );
        window.addEventListener( 'touchmove', this.handleTouchMove.bind(this) );

    }

    handleMouseMove( event ) {

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }

    handleTouchMove( event ) {

        if ( event.touches && event.touches.length > 0 ) {
            this.handleMouseMove( event.touches[0] );
        }

    }

    update( camera ) {

        var raycaster = this.raycaster;
        var body = this.body;

        body.update( this );
        this.glow.update( camera, body );

        raycaster.setFromCamera( this.mouse, camera );

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
