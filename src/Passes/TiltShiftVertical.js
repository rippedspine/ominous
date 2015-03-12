'use strict';

import ShaderPass from './Shader';
import verticalTiltShift from '../Shaders/TiltShift/Vertical';

export default class TiltShiftVerticalPass extends ShaderPass {

    constructor() {

        super( verticalTiltShift );

        var bluriness = 4;

        this.uniforms[ 'v' ].value = bluriness / window.innerHeight;
        this.uniforms[ 'r' ].value = 0.5;

    }

}
