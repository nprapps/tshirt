$(document).ready(function() {
    var $video = $('#trailer');

    function init_player() {
        jwplayer('trailer').setup({
            modes: [{
                type: 'flash',
                src: 'http://www.npr.org/templates/javascript/jwplayer/player.swf',
                config: {
                    skin: 'http://media.npr.org/templates/javascript/jwplayer/skins/mle/npr-video-archive/npr-video-archive.zip',
                    file: 'http://pd.npr.org/npr-mp4/npr/nprvid/2013/11/TRAILER2-n.mp4',
                    image: 'img/trailer-poster-800.jpg'
                }
            }, {
                type: 'html5',
                config: {
                    file: 'http://pd.npr.org/npr-mp4/npr/nprvid/2013/11/TRAILER2-n.mp4',
                    image: 'img/trailer-poster-800.jpg'
                }
            }],
            bufferlength: '5',
            controlbar: 'over',
            icons: 'true',
            autostart: false,
            width: $video.width(),
            height: $video.height()
        });
    }

    function on_resize() {
        var new_width = $('.video-container').width();
        var new_height = Math.floor(new_width * 9 / 16);

        $video.width(new_width + 'px').height(new_height + 'px');
        $('#trailer_wrapper').width(new_width + 'px').height(new_height + 'px');
    }
    $(window).resize(on_resize);
    
    // setup
    on_resize();
    init_player();
});
