'use strict';

import ShaderPass from './Shader';
import horizontalTiltShift from '../Shaders/TiltShift/Horizontal';

export default class TiltShiftHorizontalPass extends ShaderPass {

    constructor() {

        super( horizontalTiltShift );

        var bluriness = 4;

        this.uniforms[ 'h' ].value = bluriness / window.innerWidth;
        this.uniforms[ 'r' ].value = 0.7;

    }

}
