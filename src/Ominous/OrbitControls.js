'use strict';

import THREE from 'three';

var EPS = 0.000001;

var rotateStart = new THREE.Vector2();
var rotateEnd = new THREE.Vector2();
var rotateDelta = new THREE.Vector2();

var panStart = new THREE.Vector2();
var panEnd = new THREE.Vector2();
var panDelta = new THREE.Vector2();
var panOffset = new THREE.Vector3();

var offset = new THREE.Vector3();

var dollyStart = new THREE.Vector2();
var dollyEnd = new THREE.Vector2();
var dollyDelta = new THREE.Vector2();

var theta;
var phi;
var phiDelta = 0;
var thetaDelta = 0;
var scale = 1;
var pan = new THREE.Vector3();

var lastPosition = new THREE.Vector3();
var lastQuaternion = new THREE.Quaternion();

var STATE = {

    NONE : -1, 
    ROTATE : 0, 
    DOLLY : 1, 
    PAN : 2, 
    TOUCH_ROTATE : 3, 
    TOUCH_DOLLY : 4, 
    TOUCH_PAN : 5 

};

var state = STATE.NONE;

var quat;
var quatInverse;

var changeEvent = { type: 'change' };
var startEvent = { type: 'start'};
var endEvent = { type: 'end'};

export default class OrbitControls extends THREE.EventDispatcher {

    constructor( object, domElement ) {

        this.object = object;

        this.domElement = ( typeof domElement !== 'undefined' ) ? domElement : document.body;

        this.enabled = true;

        this.target = new THREE.Vector3();

        this.center = this.target;

        this.noZoom = false;
        this.zoomSpeed = 1.0;

        this.minDistance = 0;
        this.maxDistance = Infinity;

        this.noRotate = false;
        this.rotateSpeed = 1.0;

        this.noPan = false;
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push

        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        this.minAzimuthAngle = - Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        this.noKeys = false;

        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();

        quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
        quatInverse = quat.clone().inverse();

        this.bindEvents();

        // force an update at start
        this.update();

    }

    rotateLeft( angle ) {

        if ( typeof angle === 'undefined' ) {

            angle = this.getAutoRotationAngle();

        }

        thetaDelta -= angle;

    }

    rotateUp( angle ) {

        if ( typeof angle === 'undefined' ) {

            angle = this.getAutoRotationAngle();

        }

        phiDelta -= angle;

    }

    panLeft( distance ) {

        var te = this.object.matrix.elements;

        panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
        panOffset.multiplyScalar( - distance );

        pan.add( panOffset );

    }

    panUp( distance ) {

        var te = this.object.matrix.elements;

        // get Y column of matrix
        panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
        panOffset.multiplyScalar( distance );

        pan.add( panOffset );

    }

    pan( deltaX, deltaY ) {

        var element = this.domElement === document ? this.domElement.body : this.domElement;

        if ( this.object.fov !== undefined ) {

            var position = this.object.position;
            var offset = position.clone().sub( this.target );
            var targetDistance = offset.length();

            targetDistance *= Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );

            this.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
            this.panUp( 2 * deltaY * targetDistance / element.clientHeight );

        } else if ( this.object.top !== undefined ) {

            this.panLeft( deltaX * (this.object.right - this.object.left) / element.clientWidth );
            this.panUp( deltaY * (this.object.top - this.object.bottom) / element.clientHeight );

        } else {

            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

        }

    }

    dollyIn( dollyScale ) {

        if ( dollyScale === undefined ) {

            dollyScale = this.getZoomScale();

        }

        scale /= dollyScale;

    }

    dollyOut( dollyScale ) {

        if ( dollyScale === undefined ) {

            dollyScale = this.getZoomScale();

        }

        scale *= dollyScale;

    }

    update() {

        var position = this.object.position;

        offset.copy( position ).sub( this.target );

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion( quat );

        // angle from z-axis around y-axis

        theta = Math.atan2( offset.x, offset.z );

        // angle from y-axis

        phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

        if ( this.autoRotate && state === STATE.NONE ) {

            this.rotateLeft( this.getAutoRotationAngle() );

        }

        theta += thetaDelta;
        phi += phiDelta;

        // restrict theta to be between desired limits
        theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

        // restrict phi to be between desired limits
        phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

        var radius = offset.length() * scale;

        // restrict radius to be between desired limits
        radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

        // move target to panned location
        this.target.add( pan );

        offset.x = radius * Math.sin( phi ) * Math.sin( theta );
        offset.y = radius * Math.cos( phi );
        offset.z = radius * Math.sin( phi ) * Math.cos( theta );

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion( quatInverse );

        position.copy( this.target ).add( offset );

        this.object.lookAt( this.target );

        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set( 0, 0, 0 );

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if ( lastPosition.distanceToSquared( this.object.position ) > EPS
            || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

            this.dispatchEvent( changeEvent );

            lastPosition.copy( this.object.position );
            lastQuaternion.copy (this.object.quaternion );

        }

    }

    reset() {

        state = STATE.NONE;

        this.target.copy( this.target0 );
        this.object.position.copy( this.position0 );

        this.update();

    }


    getAutoRotationAngle() {

        return 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;

    }

    getZoomScale() {

        return Math.pow( 0.95, this.zoomSpeed );

    }

    onMouseDown( event ) {

        if ( this.enabled === false ) return;
        event.preventDefault();

        if ( event.button === this.mouseButtons.ORBIT ) {
            if ( this.noRotate ) { return; }

            state = STATE.ROTATE;

            rotateStart.set( event.clientX, event.clientY );

        } else if ( event.button === this.mouseButtons.ZOOM ) {
            if ( this.noZoom ) { return; }

            state = STATE.DOLLY;

            dollyStart.set( event.clientX, event.clientY );

        } else if ( event.button === this.mouseButtons.PAN ) {
            if ( this.noPan ) { return; }

            state = STATE.PAN;

            panStart.set( event.clientX, event.clientY );

        }

        if ( state !== STATE.NONE ) {
            document.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
            document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
            this.dispatchEvent( startEvent );
        }

    }

    onMouseMove( event ) {

        if ( !this.enabled ) { return; }

        event.preventDefault();

        var element = this.domElement;

        var width = ( element === document.body ) ? window.innerWidth : element.clientWidth;
        var height = ( element === document.body ) ? window.innerHeight : element.clientHeight;

        if ( state === STATE.ROTATE ) {

            if ( this.noRotate ) { return; }

            rotateEnd.set( event.clientX, event.clientY );
            rotateDelta.subVectors( rotateEnd, rotateStart );

            // rotating across whole screen goes 360 degrees around
            this.rotateLeft( 2 * Math.PI * rotateDelta.x / width * this.rotateSpeed );

            // rotating up and down along whole screen attempts to go 360, but limited to 180
            this.rotateUp( 2 * Math.PI * rotateDelta.y / height * this.rotateSpeed );

            rotateStart.copy( rotateEnd );

        } else if ( state === STATE.DOLLY ) {

            if ( this.noZoom === true ) return;

            dollyEnd.set( event.clientX, event.clientY );
            dollyDelta.subVectors( dollyEnd, dollyStart );

            if ( dollyDelta.y > 0 ) {

                this.dollyIn();

            } else {

                this.dollyOut();

            }

            dollyStart.copy( dollyEnd );

        } else if ( state === STATE.PAN ) {

            if ( this.noPan === true ) return;

            panEnd.set( event.clientX, event.clientY );
            panDelta.subVectors( panEnd, panStart );

            this.pan( panDelta.x, panDelta.y );

            panStart.copy( panEnd );

        }

        if ( state !== STATE.NONE ) { this.update(); }

    }

    onMouseUp( /* event */ ) {

        if ( this.enabled === false ) return;

        document.removeEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        document.removeEventListener( 'mouseup', this.onMouseUp.bind(this), false );
        this.dispatchEvent( endEvent );
        state = STATE.NONE;

    }

    onMouseWheel( event ) {

        if ( this.enabled === false || this.noZoom === true || state !== STATE.NONE ) return;

        event.preventDefault();
        event.stopPropagation();

        var delta = 0;

        if ( typeof event.wheelDelta !== 'undefined' ) { // WebKit / Opera / Explorer 9

            delta = event.wheelDelta;

        } else if ( typeof event.detail !== 'undefined' ) { // Firefox

            delta = - event.detail;

        }

        if ( delta > 0 ) {

            this.dollyOut();

        } else {

            this.dollyIn();

        }

        this.update();
        this.dispatchEvent( startEvent );
        this.dispatchEvent( endEvent );

    }

    onKeyDown( event ) {

        if ( this.enabled || this.noKeys || this.noPan ) { return; }

        switch ( event.keyCode ) {

            case this.keys.UP:
                this.pan( 0, this.keyPanSpeed );
                this.update();
                break;

            case this.keys.BOTTOM:
                this.pan( 0, - this.keyPanSpeed );
                this.update();
                break;

            case this.keys.LEFT:
                this.pan( this.keyPanSpeed, 0 );
                this.update();
                break;

            case this.keys.RIGHT:
                this.pan( - this.keyPanSpeed, 0 );
                this.update();
                break;

        }

    }

    bindEvents() {

        this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        this.domElement.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );
        this.domElement.addEventListener( 'mousewheel', this.onMouseWheel.bind(this), false );
        this.domElement.addEventListener( 'DOMMouseScroll', this.onMouseWheel.bind(this), false ); // firefox

        // window.addEventListener( 'keydown', this.onKeyDown.bind(this), false );        

    }

}
