/*
    Author: Lee Stemkoski
*/

var THREE = require('three');

var glslify = require('glslify');

var shader = glslify({
    fragment: './shader.frag',
    vertex: './shader.vert',
    sourceOnly: true
});

module.exports = {

    uniforms: require('./uniforms'),
    fragmentShader: shader.fragment,
    vertexShader: shader.vertex,

    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true

};