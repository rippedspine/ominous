'use strict';

import THREE from 'three';
import SimplexNoise from 'simplex-noise';
import Alea from 'alea';

var seed = 50;
var engine = new Alea(seed);
var simplex = new SimplexNoise(engine);

var abs = Math.abs;

export default class Terrain extends THREE.Mesh {

    constructor( options ) {

        var geometry = new TerrainGeometry( options );
        var material = new TerrainMaterial( options );

        super( geometry, material );

        this.rotation.x = Math.PI * -0.5;
        this.position.y = -15;

        this.castShadow = true;
        this.recieveShadow = true;

    }

}

class TerrainGeometry extends THREE.PlaneGeometry {

    constructor( options ) {

        this._resolution = options.resolution;
        this._side = options.side;

        super(
            this._side,
            this._side,
            this._resolution - 1,
            this._resolution - 1
        );

        this._applyHeightData( this._getHeightData() );

        this.computeFaceNormals();
        this.computeVertexNormals();
    }

    _applyHeightData( data ) {

        var vertices = this.vertices;
        var len = vertices.length;

        for (var i = 0; i < len; i++) {

            vertices[ i ].z = data[ i ];

        }

    }

    _getHeightData() {

        var res = this._resolution;
        var size = res * res;

        var data = new Uint8Array( size );

        var quality = 1;
        var z = 20;

        for ( var j = 0; j < 4; j ++ ) {

            for ( var i = 0; i < size; i ++ ) {

                var x = i % res;
                var y = ~~ ( i / res );

                data[ i ] += abs( simplex.noise3D( x / quality, y / quality, z ) * quality * 2 );

            }

            quality *= 2;

        }

        return data;

    }

}

class TerrainMaterial extends THREE.MeshLambertMaterial {

    constructor( options ) {

        super( options );

        this.shading = THREE.FlatShading;

    }

}
