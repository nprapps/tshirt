$(document).ready(function() {
    var $w = $(window);
    var $carousel = $('.carousel');
	var $scrollcontent = $('#explainer');
    var $titlecard = $('.titlecard');
    var $titlecard_wrapper = $('.titlecard-wrapper')
    var $titlecard_outer_wrapper = $('.titlecard-outer-wrapper');
    
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
        $carousel.width(window_width + 'px').height(window_height + 'px');
        $titlecard_wrapper.width(w + 'px').height(h + 'px');
        $titlecard_wrapper.css('margin', h_offset + 'px ' + w_offset + 'px');
        $titlecard_outer_wrapper.height(window_height + 'px');
        $scrollcontent.css('marginTop', window_height + 'px');
    }
    
    function setup_videos() {
        for (var i = 0; i < chapters.length; i++) {
            var $chapter = $('#' + chapters[i]);
            var $iframe = $('#video-' + chapters[i])[0];
            var $player = $f($iframe);

            $player.addEvent('ready', function() {
                console.log('player ready');
                //$player.api('setVolume', 0);
                //$player1.api('play');
                //$player1.api('seekTo', 3);
                //$player1.api('pause');
            });
            
            $chapter.find('.btn-play').on('click', function() {
                var this_chapter = $(this).parents('.chapter').attr('id');
                var $this_iframe = $('#video-' + this_chapter)[0];
                var $this_player = $f($this_iframe);

                $this_player.api('play');
                $('.video-wrapper').addClass('animated fadeIn backer');
                //$("#explain").addClass("revealed" );
                console.log($(this));
            });
    
            $chapter.find('.btn-pause').on( 'click', function() {
                var this_chapter = $(this).parents('.chapter').attr('id');
                var $this_iframe = $('#video-' + this_chapter)[0];
                var $this_player = $f($this_iframe);

                $this_player.api('pause');
            });
    
            $chapter.find('.btn-mute').on( 'click', function() {
                var this_chapter = $(this).parents('.chapter').attr('id');
                var $this_iframe = $('#video-' + this_chapter)[0];
                var $this_player = $f($this_iframe);

                $this_player.api('setVolume', 0);
            });

            $chapter.find('.video-wrapper').fitVids();
        }
    }
	
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
        setup_videos();

        $(window).on('resize', on_resize);
        on_resize();
    }
    setup();

});
