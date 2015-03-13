import Ominous from './Ominous/Ominous';

function loadDOM( cb ) {

    document.addEventListener('touchstart', function(e) {
        e.preventDefault();
    });

    document.addEventListener( 'DOMContentLoaded', cb, false );
    window.addEventListener( 'load', cb, false );

};

function handleClick( event ) {

    if ( isClicked ) { return; }

    document.body.className = '';

    isClicked = true;

}

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

    var enterBtn = document.getElementById('enter');

    if ( enterBtn ) {
        enterBtn.addEventListener( 'touchstart', handleClick );
        enterBtn.addEventListener( 'click', handleClick );
    }

    isLoaded = true;

};

var isClicked = false;
var isLoaded = false;

document.title = 'O M I N O U S';

loadDOM( bootstrap );
