'use strict';

import THREE from 'three';
import { real } from '../Lib/random';
import { cubic } from '../Lib/interpolation';

import { pointsWorm } from './data/play';

var clamp = THREE.Math.clamp;
var random = Math.random;
var sin = Math.sin;
var cos = Math.cos;
var now = Date.now;

export default class TetraWorm extends THREE.Object3D {

    constructor( options ) {

        this._previousNow = now();

        this._time = 0;
        this._timeDivider = options.timeDivider || 50;
        this._multiplier = options.multiplier || 200;

        this._divider = 1.5;

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

        this._play = options.play || false;
        this._counter = -1;

        super();

        this._interpolatePoints = this._getStartInterpolatePoints();
        this._generateParticles( options.numParticles || 256 );
        this._bindDOMEvents();

    }

    update() {

        var t = now();

        var position = this._getPosition();

        var particles = this._particles;
        var positions = this._particlesPosition;
        var rotations = this._particlesRotation;
        var offsets = this._particlesOffset;
        var len = this._particles.length;

        var mouseLength = position.clone().length(this._mousePosition);

        this._particlesPosition.unshift( position );
        this._particlesPosition.pop();

        this._time += (t - this._previousNow) / clamp(-(30 - mouseLength), 15, 60);
        this._previousNow = t;

        var p, pos, rot, offset;

        for (var i = 0, l = len; i < l; i++) {

            p = particles[i];
            pos = positions[i];
            rot = rotations[i];
            offset = offsets[i];

            p.position.x = pos.x + offset.x;
            p.position.y = pos.y + offset.y;
            p.position.z = pos.z + offset.z;

            p.rotation.x += rot.x;
            p.rotation.y += rot.y;
            p.rotation.z += rot.z;

        }
    }


    _getPosition() {

        var t = this._time / this._timeDivider;
        var ips = this._interpolatePoints;
        var time = now() * 0.0005;

        if ( t > 1 ) {

            this._time %= this._timeDivider;
            t = this._time / this._timeDivider;

            ips.shift();

            if ( this._play ) {

                if (this._counter++ >= pointsWorm.length - 1) {
                    this._counter = 0;
                }

                ips.push(pointsWorm[this._counter]);

            } else {

                var mousePos = this._mousePosition;
                var attractOriginY = this._attractOrigin.y;

                if ( this._mousePositionChanged ) {

                    ips.push({
                        x: mousePos.x,
                        y: mousePos.y,
                        z: mousePos.z
                    });

                } else if ( this._attractor ) {

                    ips.push({
                        x: sin( time * t * .7 ) * 50,
                        y: (cos( time * t * .5 ) * 40) + attractOriginY,
                        z: cos( time * t * .3 ) * 50
                    });

                }

            }

            this._mousePositionChanged = false;

        }

        var x = cubic( ips[0].x, ips[1].x, ips[2].x, ips[3].x, t );
        var y = cubic( ips[0].y, ips[1].y, ips[2].y, ips[3].y, t );
        var z = cubic( ips[0].z, ips[1].z, ips[2].z, ips[3].z, t );

        return new THREE.Vector3(x, y, z);

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

    _generateParticles( numParticles ) {

        var particleColor = this._particleColor;
        var particleSize = this._particleSize;
        var particle, scale;

        for (var i = 0, l = numParticles; i < l; i++) {

            scale = (l - i) / l;

            particle = new TetraWormParticle(

                particleColor,
                particleSize * (scale)

            );

            this._addParticle( particle );

        }

    }

    _addParticle( particle ) {

        var ps = this._particleSize * 2;

        this._particles.push( particle );

        this._particlesOffset.push({
            x: real(-ps, ps),
            y: real(-ps, ps),
            z: real(-ps, ps)
        });

        this._particlesPosition.push({
            x: 0,
            y: 0,
            z: this._camera.position.z * 2
        });

        this._particlesRotation.push({
            x: random() * 0.025,
            y: random() * 0.025,
            z: random() * 0.025
        });

        this.add( particle );

    }

    _getStartInterpolatePoints() {

        if ( this._play ) {

            var l = pointsWorm.length - 1;

            return [
                pointsWorm[l - 3],
                pointsWorm[l - 2],
                pointsWorm[l - 1],
                pointsWorm[l]
            ];

        } else {

            var v3;

            if ( this._attractor ) {

                this._attractOrigin = this._attractor.body.origin;

                v3 = new THREE.Vector3(
                    this._attractOrigin.x,
                    this._attractOrigin.y * 1.5,
                    50
                );

            } else {

                v3 = new THREE.Vector3(
                    real(-this._multiplier, this._multiplier),
                    real(-this._multiplier, this._multiplier),
                    real(-this._multiplier, this._multiplier)
                );

            }

            return [ v3, v3, v3, v3 ];

        }

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

    }

}
