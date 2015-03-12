// http://paulbourke.net/miscellaneous/interpolation/
'use strict';

var cos = Math.cos;
var PI = Math.PI;

export function cubic( y0, y1, y2, y3, mu ) {

    var mu2 = mu * mu;
    var a0 = -0.5 * y0 + 1.5 * y1 - 1.5 * y2 + 0.5 * y3;
    var a1 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
    var a2 = -0.5 * y0 + 0.5 * y2;
    var a3 = y1;

    return (a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3);

}

export function cosine( y0, y1, mu ) {

    var mu2 = ( 1 - cos( mu * PI )) * 0.5;

    return y0 * ( 1 - mu2 ) + y1 * mu2;

}
