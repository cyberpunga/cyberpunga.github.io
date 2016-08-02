function goHome() {
	Reveal.slide( 0, 0 );
}
function goDown() {
    Reveal.down();
}
function goRight() {
    Reveal.right();
}

Reveal.addEventListener( 'slidechanged', function( event ) {
    if( Reveal.isFirstSlide() ) {
        $('#header').css({
            opacity: 0,
            pointerEvents: 'none'
        });
    } else if( Reveal.isLastSlide() ) {
        $('#header').css({
            opacity: 0,
            pointerEvents: 'none'
        });
    } else {
    	$('#header').css({
    		opacity: 1,
            pointerEvents: 'auto',
            cursor: 'pointer'
    	});
    }
} );


Reveal.addEventListener( 'fin', function() {
    console.log('soy el fin.');
}, false );
/*
var indices = Reveal.getIndices( document.getElementById( 'sectionID' ) );
Reveal.slide( indices.h, indices.v );
*/