'use strict';

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

var glslify = require('glslify');

var shader = glslify({

    fragment: './shader.frag',
    vertex: './shader.vert',
    sourceOnly: true

});

module.exports = {

    uniforms: require('./uniforms'),
    fragmentShader: shader.fragment,
    vertexShader: shader.vertex

};
