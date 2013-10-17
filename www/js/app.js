$(document).ready(function() {
	
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

});
