$(document).ready(function() {
    var $w = $(window);
    var $btn_back = $('#btn-back');
    var $btn_next = $('#btn-next');
	var $scrollcontent = $('.explainer');
    var $titlecard = $('.titlecard');
    var $titlecard_wrapper = $('.titlecard-wrapper')
    var $titlecard_outer_wrapper = $('.titlecard-outer-wrapper');
    var k = kontext(document.querySelector('.kontext'));
    
    var aspect_width = 16;
    var aspect_height = 10;
    var chapters = [ 'intro', 'plants', 'robots', 'humans', 'boats', 'you' ];
    var window_width;
    var window_height;
    
    function on_resize() {
        var w;
        var h;
        var w_optimal;
        var h_optimal;
        var w_offset = 0;
        var h_offset = 0;

        window_width = $w.width();
        window_height = $w.height();
        
        // calculate optimal width if height is constrained to window height
        w_optimal = (window_height * aspect_width) / aspect_height;
        
        // calculate optimal height if width is constrained to window width
        h_optimal = (window_width * aspect_height) / aspect_width;
        
        // decide whether to go with optimal height or width
        if (w_optimal > window_width) {
            w = w_optimal;
            h = window_height;
        } else {
            w = window_width;
            h = h_optimal;
        }
        w_offset = (window_width - w) / 2;
        h_offset = (window_height - h) / 2;
        
        // size the divs accordingly
        $titlecard_wrapper.width(w + 'px').height(h + 'px');
        $titlecard_wrapper.css('margin', h_offset + 'px ' + w_offset + 'px');
        $titlecard_outer_wrapper.height(window_height + 'px');
        $scrollcontent.css('marginTop', window_height + 'px');
    }
    
    function setup_video(chapter) {
        var $chapter = $('#' + chapter);
        var $iframe = $('#video-' + chapter)[0];
        var $player = $f($iframe);
        var $btn_play = $chapter.find('.btn-play');
        var $btn_pause = $chapter.find('.btn-pause');
        var $btn_mute = $chapter.find('.btn-mute');

        $player.addEvent('ready', function() {
            //console.log('player ready');
            //$player.api('setVolume', 0);
            //$player.api('play');
            //$player.api('seekTo', 3);
            //$player.api('pause');
        });
        
        $btn_play.on('click', function() {
            console.log('clicked!');
            var this_chapter = $(this).parents('.chapter').attr('id');
            var $this_iframe = $('#video-' + this_chapter)[0];
            var $this_player = $f($this_iframe);

            $this_player.api('play');
            $('#' + this_chapter).find('.video-wrapper').addClass('animated fadeIn backer');
            //$("#explain").addClass("revealed" );
            console.log(this_chapter);
        });

        $btn_pause.on('click', function() {
            console.log('clicked!');
            var this_chapter = $(this).parents('.chapter').attr('id');
            var $this_iframe = $('#video-' + this_chapter)[0];
            var $this_player = $f($this_iframe);

            $this_player.api('pause');
        });

        $btn_mute.on('click', function() {
            console.log('clicked!');
            var this_chapter = $(this).parents('.chapter').attr('id');
            var $this_iframe = $('#video-' + this_chapter)[0];
            var $this_player = $f($this_iframe);

            $this_player.api('setVolume', 0);
        });
    }
    
    /* 
     * Kontext sideways navigation
     */
     
    var touchX = 0;
    var touchConsumed = false;

    k.changed.add(function(layer, index) {
        // do something when the layer changes
    });

    document.addEventListener( 'keyup', function( event ) {
        if( event.keyCode === 37 ) k.prev();
        if( event.keyCode === 39 ) k.next();
    }, false );

    document.addEventListener( 'touchstart', function( event ) {
        touchConsumed = false;
        lastX = event.touches[0].clientX;
    }, false );

    document.addEventListener( 'touchmove', function( event ) {
        event.preventDefault();

        if( !touchConsumed ) {
            if( event.touches[0].clientX > lastX + 10 ) {
                k.prev();
                touchConsumed = true;
            }
            else if( event.touches[0].clientX < lastX - 10 ) {
                k.next();
                touchConsumed = true;
            }
        }
    }, false );

	// sideways nav buttons
	$btn_next.on('click', function() {
	    k.next();
	    console.log(k.getIndex() + ' of ' + k.getTotal());
	});

	$btn_back.on('click', function() {
	    k.prev();
	    console.log(k.getIndex() + ' of ' + k.getTotal());
	});


	$('#text-mover').click(function() {
		$.smoothScroll({
			speed: 1500,
			scrollTarget: '#explainer'
		});
		return false;
	});
	
	
	/* 
	 * Setup functions 
	 */
    function setup() {
        // setup videos
        for (var i = 0; i < chapters.length; i++) {
            setup_video(chapters[i]);
        }
        $('.video-wrapper').fitVids();

        $(window).on('resize', on_resize);
        on_resize();
    }
    setup();

});
