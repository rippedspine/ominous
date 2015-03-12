'use strict';

import ShaderPass from './Shader';
import rgbShift from '../Shaders/RGBShift';

export default class RGBShiftPass extends ShaderPass {

    constructor() {

        super( rgbShift );

        this.uniforms[ 'amount' ].value = 0.0025;

    }

}
