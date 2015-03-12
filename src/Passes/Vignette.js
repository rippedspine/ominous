'use strict';

import ShaderPass from './Shader';
import vignette from '../Shaders/Vignette';

export default class VignettePass extends ShaderPass {

    constructor() {

        super( vignette );

        this.uniforms[ 'offset' ].value = 1.5;
        this.uniforms[ 'darkness' ].value = 1.2;

    }

}
