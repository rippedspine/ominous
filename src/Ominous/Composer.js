'use strict';

import EffectComposer from '../PostProcessing/EffectComposer';

import RenderPass from '../Passes/Render';
import TiltShiftVerticalPass from '../Passes/TiltShiftVertical';
import TiltShiftHorizontalPass from '../Passes/TiltShiftHorizontal';
import VignettePass from '../Passes/Vignette';
import RGBShiftPass from '../Passes/RGBShift';

export default class Composer extends EffectComposer {

    constructor( options ) {

        super( options.renderer );

        this.renderPass = new RenderPass(
            options.scene,
            options.camera
        );

        this.addPass( this.renderPass );
        this.addPass( new RGBShiftPass() );
        this.addPass( new VignettePass() );
        this.addPass( new TiltShiftVerticalPass() );
        this.addPass( new TiltShiftHorizontalPass() );

        this.passes[this.passes.length - 1].renderToScreen = true;

    }

    setCamera( camera ) {

        this.renderPass.camera = camera;

    }

}
