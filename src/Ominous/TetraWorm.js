/*
 * @author https://github.com/tditlu
 */

'use strict';

import THREE from 'three';
import { real } from '../Lib/random';
import { cubic } from '../Lib/interpolation';

var random = Math.random;
var now = Date.now;

export default class TetraWorm extends THREE.Object3D {

    constructor( options ) {

        this._interpolatePoints = getInterpolatePoints();

        this._previousNow = now();

        this._time = 0;
        this._timeDivider = options.timeDivider || 100;
        this._multiplier = options.multiplier || 100;

        this._divider = 1 / this._multiplier;

        this._particles = [];
        this._particlesPosition = [];
        this._particlesRotation = [];
        this._particlesOffset = [];

        this._particleColor = options.particleColor || 0xffffff;
        this._particleSize = options.particleSize || 3;

        this._camera = options.camera;
        this._mousePosition = new THREE.Vector3();
        this._mousePositionChanged = false;

        this._attractor = options.attractor || false;

        super();

        this._generateParticles( options.numParticles || 256 );
        this._bindDOMEvents();

    }

    update() {

        var position = this._getPosition();

        var particles = this._particles;
        var positions = this._particlesPosition;
        var rotations = this._particlesRotation;
        var offsets = this._particlesOffset;
        var multiplier = this._multiplier;

        var len = this._particles.length;

        this._particlesPosition.unshift( position );
        this._particlesPosition.pop();

        var t = now();
        this._time += (t - this._previousNow) / 30;
        this._previousNow = t;

        for (var i = 0, l = len; i < l; i++) {

            var p = particles[i];
            var pos = positions[i];
            var rot = rotations[i];
            var offset = offsets[i];

            p.position.x = (pos.x * multiplier) + offset.x;
            p.position.y = (pos.y * multiplier) + offset.y;
            p.position.z = (pos.z * multiplier) + offset.z;

            p.rotation.x += rot.x;
            p.rotation.y += rot.y;
            p.rotation.z += rot.z;

            p.scale.x = p.scale.y = p.scale.z = (l - i) / l;

        }
    }

    _bindDOMEvents() {

        document.addEventListener('mousemove', this._onMouseMove.bind(this));
        document.addEventListener('touchmove', this._onTouchMove.bind(this));

    }

    _onMouseMove( event ) {

        var camera = this._camera;
        var vector = new THREE.Vector3();

        vector.set(
             (event.clientX / window.innerWidth)  * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );

        vector.unproject( camera );

        var dir = vector.sub( camera.position ).normalize();
        var distance = -camera.position.z / dir.z;

        this._mousePosition = camera.position.clone().add( dir.multiplyScalar(distance) );
        this._mousePositionChanged = true;

    }

    _onTouchMove( event ) {

        if ( event.touches && event.touches.length > 0 ) {
            this._onMouseMove( event.touches[0] );
        }

    }

    _getPosition() {

        var t = this._time / this._timeDivider;

        var mousePos = this._mousePosition;
        var attractPos = this._attractor.position;

        var multiplier = this._multiplier;
        var ips = this._interpolatePoints;
        var divider = this._divider * 30;

        if ( t > 1 ) {

            this._time %= this._timeDivider;
            t = this._time / this._timeDivider;

            ips.shift();

            if ( this._mousePositionChanged ) {

                ips.push(new THREE.Vector3(
                    mousePos.x / multiplier,
                    mousePos.y / multiplier,
                    mousePos.z / multiplier
                ));

            } else if ( this._attractor ) {

                ips.push(new THREE.Vector3(
                    ((attractPos.x) / multiplier) + real( -divider, divider ),
                    ((attractPos.y - 10) / multiplier) + real( -divider, divider ),
                    ((attractPos.z) / multiplier) + real( -divider, divider )
                ));

            } else {

                ips.push(new THREE.Vector3(
                    (random() * 2) - 1,
                    (random() * 2) + 1,
                    (random() * 2) - 1
                ));

            }

            this._mousePositionChanged = false;

        }

        var x = cubic(
            ips[0].x,
            ips[1].x,
            ips[2].x,
            ips[3].x,
            t
        );

        var y = cubic(
            ips[0].y,
            ips[1].y,
            ips[2].y,
            ips[3].y,
            t
        );

        var z = cubic(
            ips[0].z,
            ips[1].z,
            ips[2].z,
            ips[3].z,
            t
        );

        return new THREE.Vector3(x, y, z);

    }

    _generateParticles( numParticles ) {

        var particleColor = this._particleColor;
        var particleSize = this._particleSize;

        for (var i = 0; i < numParticles; i++) {
            this._addParticle(
                new TetraWormParticle( particleColor, particleSize )
            );
        }

    }

    _addParticle( particle ) {

        var ps = this._particleSize * 2;

        var offset = new THREE.Vector3(
            ((random() * 2) - 1) * ps,
            ((random() * 2) - 1) * ps,
            ((random() * 2) - 1) * ps
        );

        var position = new THREE.Vector3(
            0,
            0,
            this._camera.position.z * 2
        );

        var rotation = new THREE.Vector3(
            random() * 0.025,
            random() * 0.025,
            random() * 0.025
        );

        this._particles.push( particle );
        this._particlesOffset.push( offset );
        this._particlesPosition.push( position );
        this._particlesRotation.push( rotation );

        this.add( particle );

    }

}

class TetraWormParticle extends THREE.Mesh {

    constructor( color, size ) {

        var geometry = new THREE.TetrahedronGeometry( size, 0 );

        var material = new THREE.MeshLambertMaterial({
            color: color,
            shading: THREE.FlatShading
        });

        super( geometry, material );

        this.castShadow = true;
        this.recieveShadow = true;

    }

}

function getInterpolatePoints() {

    var a = new THREE.Vector3( 0, 0, 0 );

    return [
        a, a,
        new THREE.Vector3(
            (random() * 2) - 1,
            (random() * 2) - 1,
            (random() * 2) - 1
        ),
        new THREE.Vector3(
            (random() * 2) - 1,
            (random() * 2) - 1,
            (random() * 2) - 1
        )
    ];

}
