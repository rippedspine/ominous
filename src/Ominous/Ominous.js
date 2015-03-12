'use strict';

import THREE from 'three';

import {

    FAR,
    BACKGROUND_COLOR,
    GROUND_COLOR

} from './Config';

import WebGLRenderer from './WebGLRenderer';
import World from './World';

import Composer from './Composer';
import PerspectiveCamera from './PerspectiveCamera';

import Terrain from './Terrain';
import Tetrahedron from './Tetrahedron';
import TetraWorm from './TetraWorm';

import {

    DirectionalLight,
    PointLight

} from './Lights';

export default class Ominous {

    constructor() {

        this._world = new World();

        this._camera = new PerspectiveCamera();

        this._renderer = new WebGLRenderer();

        this._terrain = new Terrain({

            color: GROUND_COLOR,
            side: 400,
            resolution: 32

        });

        this._tetrahedron = new Tetrahedron({

            color: 0xABE2F7,
            size: 15,
            viewVector: this._camera.position

        });

        this._tetraWorm = new TetraWorm({

            particleColor: this._tetrahedron.color,
            attractor: this._tetrahedron,
            camera: this._camera

        });

        this._lightDirectional = new DirectionalLight({

            color: 0xdfebff,
            intensity: 0.5

        });

        this._lightPoint = new PointLight({

            color: 0xABE2F7,
            intensity: 2,
            position: new THREE.Vector3( 0, 10, 0 )

        });

        this._world.add( this._terrain );
        this._world.add( this._tetrahedron );
        this._world.add( this._tetraWorm );

        this._world.add( this._lightDirectional );
        this._world.add( this._lightPoint );
        this._world.add( new THREE.AmbientLight( BACKGROUND_COLOR ) );

        this._composer = new Composer({

            renderer: this._renderer,
            scene: this._world,
            camera: this._camera

        });

        this.debug = false;

        this._bindDOMEvents();
        this._animate();

    }

    _bindDOMEvents() {

        window.addEventListener( 'keydown', this._onKeyDown.bind(this) );

    }

    _onKeyDown( event ) {

        var key = event.keyCode;

        if ( key === 32 /* space */ ) {

            this._camera = (this._camera === this._cameraOverview) ? this._camera : this._cameraOverview;

            this._composer.setCamera( this._camera );
            this._tetraWorm.setCamera( this._camera );

        }

        if ( key === 68 /* D */ ) {

            this.debug = !this.debug;

        }

    }

    _onDebug() {

        if ( this.debug ) {

            this._camera.far = 4000;
            this._world.fog.far = this._camera.far;

        } else {

            this._camera.far = FAR;
            this._world.fog.far = this._camera.far;

        }

        this._camera.updateProjectionMatrix();

    }

    _animate() {

        requestAnimationFrame( this._animate.bind(this) );

        this._world.update();
        this._camera.update();

        this._tetraWorm.update();
        this._tetrahedron.update( this._camera );

        this._lightPoint.update( this._tetrahedron.position );

        this._camera.lookAt({
            x: this._tetrahedron.position.x,
            y: 20,
            z: this._tetrahedron.position.z
        });

        this.render();

    }

    render() {

        this._onDebug();

        this.debug ? this._renderer.render( this._world, this._camera ) : this._composer.render( 0.1 );

    }

}
