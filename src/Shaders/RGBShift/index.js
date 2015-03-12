'use strict';

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

var glslify = require('glslify');

var shader = glslify({
    fragment: './shader.frag',
    vertex: './shader.vert',
    sourceOnly: true
});

module.exports = {

    uniforms: require('./uniforms'),
    vertexShader: shader.vertex,
    fragmentShader: shader.fragment

};
