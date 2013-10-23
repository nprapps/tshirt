$(document).ready(function() {
    var $w = $(window);
    var $btn_back = $('#btn-back');
    var $btn_next = $('#btn-next');
    var $layers = $('.layer');
	var $layer_media = $('.layer-media');
	var $nav = $('nav');
	var $nav_btn = $nav.find('h3');
	var $nav_item_wrapper = $nav.find('.nav-item-wrapper');
	var $scrollcontent = $('.explainer');
    var $titlecard = $('.titlecard');
    var $titlecard_wrapper = $('.titlecard-wrapper')
    var $titlecard_outer_wrapper = $('.titlecard-outer-wrapper');
    var $video_wrapper = $('.video-wrapper');
    var k = kontext(document.querySelector('.kontext'));
    
    var aspect_width = 16;
    var aspect_height = 10;
    var chapters = [ 'title', 'plants', 'robots', 'humans', 'boats', 'you', 'about' ];
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
//        $layer_media.height(window_height + 'px');
//        $titlecard_wrapper.width(w + 'px').height(h + 'px');
//        $titlecard_wrapper.css('margin', h_offset + 'px ' + w_offset + 'px');
//        $titlecard_outer_wrapper.height(window_height + 'px');
//        $scrollcontent.css('marginTop', window_height + 'px');
    }
    
    function setup_chapters(chapter) {
		var $chapter = $('#' + chapter);
		var $btn_play = $chapter.find('.btn-play');

    	if (chapter != 'title' && chapter != 'about') {
			var $iframe = $('#video-' + chapter)[0];
			var $player = $f($iframe);
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
				var this_chapter = $(this).parents('.layer').attr('id');
				var $this_iframe = $('#video-' + this_chapter)[0];
				var $this_player = $f($this_iframe);

				$this_player.api('play');
				$('#' + this_chapter).find('.video-wrapper').addClass('animated fadeIn backer');
				//$("#explain").addClass("revealed" );
				console.log(this_chapter);
			});

			$btn_pause.on('click', function() {
				console.log('clicked!');
				var this_chapter = $(this).parents('.layer').attr('id');
				var $this_iframe = $('#video-' + this_chapter)[0];
				var $this_player = $f($this_iframe);

				$this_player.api('pause');
			});

			$btn_mute.on('click', function() {
				console.log('clicked!');
				var this_chapter = $(this).parents('.layer').attr('id');
				var $this_iframe = $('#video-' + this_chapter)[0];
				var $this_player = $f($this_iframe);

				$this_player.api('setVolume', 0);
			});
		} else if (chapter == 'title') {
			$btn_play.on('click', function() {
				k.show(1);
				$('#plants').find('.btn-play').trigger('click');
			});
		} else { // about
		    // do something else?
		}
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
	    console.log((k.getIndex() + 1) + ' of ' + k.getTotal());
	    reset_layers();
	});

	$btn_back.on('click', function() {
	    k.prev();
	    console.log((k.getIndex() + 1) + ' of ' + k.getTotal());
	    reset_layers();
	});
	
	function reset_layers() {
	    // reset titlecards
	    $video_wrapper.removeClass('animated').removeClass('fadeOut').removeClass('backer');
		
		// stop video; set it back to the beginning
        for (var i = 0; i < chapters.length; i++) {
        	if (chapters[i] != 'title') {
				var this_chapter = chapters[i];
				var $this_iframe = $('#video-' + this_chapter)[0];
				var $this_player = $f($this_iframe);
				//$this_player.api('seekTo', 0);
				$this_player.api('pause');
//				$this_player.api('unload'); <- TODO: should we be using this instead of seekTo/pause? not working for me.
//				console.log($this_player);
			}
        }
	}
	
	
	/*
	 * Chapter navigation
	 */
	function setup_chapter_nav(chapter, id) {
        $('#nav-' + chapter).on('click', function() {
            k.show(id);
            $nav_btn.trigger('click');
        });
	}

	$nav_btn.on('click', function() {
        $nav_item_wrapper.toggleClass('backer');
        $nav.toggleClass('animated slideInUp');
	});
	
	
	/*
	 * Explainer text
	 */
	/* $('#text-mover').click(function() {
		$.smoothScroll({
			speed: 1500,
			scrollTarget: '#explainer'
		});
		return false;
	}); */
	
	
	/* 
	 * Setup functions 
	 */
    function setup() {
        // setup chapter layers and navigation
        for (var i = 0; i < chapters.length; i++) {
			setup_chapters(chapters[i]);
            setup_chapter_nav(chapters[i], i);
        }
        $video_wrapper.fitVids();
        

        $(window).on('resize', on_resize);
        on_resize();
    }
    setup();

});
