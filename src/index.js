import Ominous from './Ominous/Ominous';

function loadDOM( cb ) {

    document.addEventListener( 'DOMContentLoaded', cb, false );
    window.addEventListener( 'load', cb, false );

};

function bootstrap() {

    if ( isLoaded ) { return; }

    document.body.className = 'loaded';

    if ( !window.WebGLRenderingContext ) {

        window.location = 'http://get.webgl.org';

    } else {

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('webgl');

        if ( !context ) {

            window.location = 'http://get.webgl.org/troubleshooting';

        } else {

            new Ominous();

        }

    }

    document.getElementById('enter').addEventListener('click', function() {
        if ( isClicked ) { return; }

        document.body.className = '';

        isClicked = true;
    });

    isLoaded = true;

};

var isClicked = false;
var isLoaded = false;

document.title = 'O M I N O U S';

loadDOM( bootstrap );
