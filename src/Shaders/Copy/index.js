/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
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
