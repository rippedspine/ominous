'use strict';

var random = Math.random;
var ceil = Math.ceil;

export function real( min, max ) {

    return random() * (max - min) + min;

}

export function integer( min, max ) {

    return ceil(random() * (max - min) + min);

}
