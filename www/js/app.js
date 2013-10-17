$(document).ready(function() {
	
	//titlecard sizer
	var $scrollcontent = $('#explainer');
    var $titlecard = $('.titlecard');
    var $titlecard_wrapper = $('.titlecard-wrapper')
    var $titlecard_outer_wrapper = $('.titlecard-outer-wrapper');
    var $w = $(window);
    
    var aspect_width = 16;
    var aspect_height = 10;
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
    
    $(window).on('resize', on_resize);
    on_resize();
	
	//video 1
	var $iframe = $('#video')[0];
	var $player = $f($iframe);
	
	//video 2
	var $iframe1 = $('#video1')[0];
	var $player1 = $f($iframe1);
	
	$("#video-wrapper").fitVids();
	
	$player.addEvent('ready', function() {
		//console.log('player ready');
		//$player.api('setVolume', 0);
		//$player1.api('play');
		//$player1.api('seekTo', 3);
		//$player1.api('pause');
	});
	
	$( "#play" ).on( "click", function() {
		$player.api('play');
		$("#video-wrapper").addClass("animated fadeIn backer" );
		//$("#explain").addClass("revealed" );
	});
	
	$( "#pause" ).on( "click", function() {
		$player.api('pause');
	});
	
	$( "#mute" ).on( "click", function() {
		$player.api('setVolume', 0);
	});
	
	$( "#play1" ).on( "click", function() {
		$player1.api('play');
	});
	
	$('#text-mover').click(function() {
		$.smoothScroll({
			speed: 1500,
			scrollTarget: '#explainer'
		});
		return false;
	});

});
