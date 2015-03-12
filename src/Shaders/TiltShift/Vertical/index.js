/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
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
