'use strict';

import ShaderPass from './Shader';
import verticalTiltShift from '../Shaders/TiltShift/Vertical';

export default class TiltShiftVerticalPass extends ShaderPass {

    constructor( bluriness, center ) {

        super( verticalTiltShift );

        this.bluriness = bluriness || 3;
        this.center = center || 0.5;

        this.uniforms[ 'v' ].value = this.bluriness / window.innerHeight;
        this.uniforms[ 'r' ].value = this.center;

        window.addEventListener( 'resize', this._onResize.bind(this) );

    }

    _onResize() {

        this.uniforms[ 'v' ].value = this.bluriness / window.innerHeight;

    }

}
