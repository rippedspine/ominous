'use strict';

import ShaderPass from './Shader';
import horizontalTiltShift from '../Shaders/TiltShift/Horizontal';

export default class TiltShiftHorizontalPass extends ShaderPass {

    constructor( bluriness, center ) {

        super( horizontalTiltShift );

        this.bluriness = bluriness || 3;
        this.center = center || 0.7;

        this.uniforms[ 'h' ].value = this.bluriness / window.innerWidth;
        this.uniforms[ 'r' ].value = this.center;

        window.addEventListener( 'resize', this._onResize.bind(this) );

    }

    _onResize() {

        this.uniforms[ 'h' ].value = this.bluriness / window.innerWidth;

    }

}
