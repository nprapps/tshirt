$(document).ready(function() {
    var $b = $('body');
    var $w = $(window);
    var $btn_back = $('#btn-back');
    var $btn_next = $('#btn-next');
    var $layers = $('.layer');
    var $layer_media = $('.layer-media');
    var $nav = $('nav');
    var $nav_btn = $nav.find('h3.btn-chapter');
    var $nav_item_wrapper = $nav.find('.nav-item-wrapper');
    var $nav_chapter_title = $('#nav-chapter-title');
    var $nav_chapter_title_prompt = $('#nav-chapter-title-prompt');
    var $titlecard = $('.titlecard');
    var $titlecard_wrapper = $('.titlecard-wrapper')
    var $titlecard_outer_wrapper = $('.titlecard-outer-wrapper');
    var $video_wrapper = $('.video-wrapper');
    var $video_inner_wrapper = $('.video-inner-wrapper');
    var $title_video = $('.title-video');
    var $video_question = $('.video-question');
    var k = kontext(document.querySelector('.kontext'));
    
    var aspect_width = 16;
    var aspect_height = 9;
    var chapters = [ 'title', 'plants', 'robots', 'humans', 'ships', 'you', 'about' ];
    var nav_height = 74;
    var nav_height_open = 228;
    var medium_nav_height = 44;
    var medium_nav_height_open = 228;
    var window_width;
    var window_height;
    
    var $d3_cotton_exports = $('#cotton-exports-d3');
    var d3_cotton_exports_data;
    
    //breakpoints
    var screen_small = 768;
    var screen_medium = 992;
    var screen_large = 1200;


    function on_resize() {
        var w;
        var h;
        var w_optimal;
        var h_optimal;
        var w_offset = 0;
        var h_offset = 0;
        var w_video;
        var h_video;
        var w_video_optimal;
        var h_video_optimal;
        
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

		$title_video.width(w + 'px').height(h + 'px');
		$title_video.css('margin', h_offset + 'px ' + w_offset + 'px');

        // size the chapter video: must be fully visible onscreen -- no negative margins
        w_video_optimal = ((window_height - nav_height) * aspect_width) / aspect_height;
        h_video_optimal = (window_width * aspect_height) / aspect_width;

        if (w_video_optimal >= window_width) {
            w_video = window_width;
            h_video = h_video_optimal;
        } else {
            w_video = w_video_optimal;
            h_video = window_height;
        }
		$video_inner_wrapper.width(w_video + 'px').height(h_video + 'px');

        // Kill top-anchored nav for small displays
        if (window_width < screen_small){
                $nav.removeAttr('data-spy').removeClass('affix');
        } else {
                $nav.attr('data-spy', 'affix');
                // fine-tune when the chapter nav affixes to the top
                $nav.attr('data-offset-top', (window_height - $nav.height()));
        }
        
        // redraw graphics (if they exist yet)
        reset_cotton_exports_graph();
    }
    
    function setup_chapters(chapter) {
		var $chapter = $('#' + chapter);
		var $btn_play = $chapter.find('.btn-play');
		var $btn_next = $chapter.find('.btn-next-chapter');
		var $btn_explain = $chapter.find('.btn-explainer-prompt');

    	if (chapter != 'title' && chapter != 'about') {
			var $iframe = $('#video-' + chapter)[0];
			var $player = $f($iframe);

			$player.addEvent('ready', function() {
				//console.log('player ready');
				//$player.api('setVolume', 0);
				//$player.api('play');
				//$player.api('seekTo', 3);
				//$player.api('pause');
				
				//show question at the end of a video
				$player.addEvent('finish', function() {
					console.log('finished');
			    	$('section.show').find('.video-question').addClass('animated fadeIn backer');
				});
				
				$player.addEvent('play', function() {
					// reset questions
					$video_question.removeClass('animated').removeClass('fadeOut').removeClass('backer');
				});
			});
			
			
			
			
		
			$btn_play.on('click', function() {
				console.log('clicked!');
				var this_chapter = $(this).parents('.layer').attr('id');
				var $this_iframe = $('#video-' + this_chapter)[0];
				var $this_player = $f($this_iframe);
				
				console.log(this_chapter);

				$this_player.api('play');
				$('#' + this_chapter).find('.video-wrapper').addClass('animated fadeIn backer');
			});
			
			
			//
			$btn_explain.on('click', function() {
				console.log('clicked!');
				goto_explainer();
			});

		} else if (chapter == 'title') {
			$btn_play.on('click', function() {
			    goto_chapter(1);
				$('#plants').find('.btn-play').trigger('click');
			});
		} else { // about
		    // do something else?
		}
    }
    
    /* 
     * Kontext sideways navigation
    
     
    var touchX = 0;
    var touchConsumed = false;

    k.changed.add(function(layer, index) {
        //do something when the layer changes
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
	    reset_video_layers();
	});

	$btn_back.on('click', function() {
	    k.prev();
	    console.log((k.getIndex() + 1) + ' of ' + k.getTotal());
	    reset_video_layers();
	});
	 */
	
	function reset_video_layers() {
	    // reset titlecards
	    $video_wrapper.removeClass('animated').removeClass('fadeOut').removeClass('backer');
	    // reset questions
	    $video_question.removeClass('animated').removeClass('fadeOut').removeClass('backer');
		
		// stop video; set it back to the beginning
        for (var i = 0; i < chapters.length; i++) {
        	if (chapters[i] != 'title' && chapters[i] != 'about') {
				var this_chapter = chapters[i];
				var $this_iframe = $('#video-' + this_chapter)[0];
				var $this_player = $f($this_iframe);
				//$this_player.api('seekTo', 0);
				$this_player.api('pause');
//				$this_player.api('unload'); //<- TODO: should we be using this instead of seekTo/pause? not working for me.
			}
        }
	}
	
	
	/*
	 * Chapter navigation
	 */
	function setup_chapter_nav(chapter, id) {
        $('#nav-' + chapter).on('click', function() {
            // jump to the chapter
            goto_chapter(id);

            // close the chapter nav
            $nav_btn.trigger('click');

            // jump to the top of the page
            $.smoothScroll({
                scrollTarget: '.kontext'
            });
        });
	}
	
	function setup_video_question(chapter, id) {
	    if (chapter != 'title' && chapter != 'about') {
	        $('#' + chapter).find('.btn-next-chapter').on('click', function() {
	            goto_chapter((id + 1));
	        });
	    }
	}
	
	function goto_chapter(id) {
	    // goto that chapter
	    k.show(id);
	    
	    // add a class to the body tag indicating what chapter we're in
	    for (var i = 0; i < chapters.length; i++) {
	        var chapter_name = chapters[i];
	        var chapter_class = 'chapter-' + chapter_name;

	        if (i == id) {
                $b.addClass(chapter_class);

                if (chapter_name != 'title' && chapter_name != 'about') {
                    $nav_chapter_title.text(COPY[chapter_name]['fullname']);
                    $nav_chapter_title_prompt.text(COPY[chapter_name]['nav_prompt']);
                } else {
                    $nav_chapter_title.text('');
                    $nav_chapter_title_prompt.text('');
                }

            } else {
                $b.removeClass(chapter_class);
            }
	    }
	    
	    // load graphics for this particular chapter
	    switch(id) {
	        case 1: // plants
	            reset_cotton_exports_graph();
	            break;
	    }
	    
	    // reset the layers, stop any video that's playing
	    reset_video_layers();
	}

	function close_nav() {
        $nav.removeClass('slideInUp').addClass('animated slideOutDown');
        $nav_item_wrapper.removeClass('backer');
	}
	
	function open_nav() {
        $nav.removeClass('slideOutDown').addClass('animated slideInUp backer');
        $nav_item_wrapper.addClass('backer');
	}
	
	$nav_btn.on('click', function() {
	    if ($nav.hasClass('slideInUp')) {
	        close_nav();
	    } else {
            open_nav();
	    }
	});
	
	
	/*
	 * Explainer text
	 */
	 
	 function goto_explainer() {
		 // the offset accounts for the height of the nav at the top of the screen
	    // (minus 1 to ensure the affix nav engages)
	    var scroll_offset = -(nav_height - 1);
	    var scroll_target = '#' + chapters[k.getIndex()] + ' .explainer';

        $.smoothScroll({
			offset: scroll_offset,
            scrollTarget: scroll_target
        });
		 
	 }
	 
	$nav_chapter_title_prompt.on('click', function() {
	    goto_explainer();
	});


    /*
     * Setup CSS animations
     */
    function setup_css_animations() {
        var prefixes = [ '-webkit-', '-moz-', '-o-', '' ];
        var keyframes = '';
        
        var this_nav_height;
        var this_nav_height_open;
        
        if (window_width < 992){
        	this_nav_height = medium_nav_height;
        	this_nav_height_open = medium_nav_height_open;
        } else {
        	this_nav_height = nav_height;
        	this_nav_height_open = nav_height_open;
        }
        
        console.log("window: " + window_width);
        
    	for (var i = 0; i < prefixes.length; i++) {
            keyframes += '@' + prefixes[i] + 'keyframes slideOutDown {';
            keyframes += '0% { height: ' + this_nav_height_open + 'px; }';
            keyframes += '100% { height: ' + this_nav_height + 'px; }';
            keyframes += '}';

            keyframes += '@' + prefixes[i] + 'keyframes slideInUp {';
            keyframes += '0% { height: ' + this_nav_height + 'px; }';
            keyframes += '100% { height: ' + this_nav_height_open + 'px; }';
            keyframes += '}';
		}
        
        var s = document.createElement('style');
        s.innerHTML = keyframes;
        $('head').append(s);
    }
    
    
    /*
     * D3 Charts
     */
    function load_graphics() {
        d3.tsv("data/cotton-exports.tsv", function(error, data) {
            d3_cotton_exports_data = data;
            d3_cotton_exports_data.forEach(function(d) {
                d.year = d3.time.format("%Y").parse(d.year);
            });
            draw_cotton_exports_graph();
        });
    }
    
    function d3_tickformat_units(d) {
        var units = [ '', ' thousand', ' million', ' billion', ' trillion'];
        var i = 0;
        while (d >= 1000) {
            i++;
            d = d / 1000;
        }
        d = d + units[i];
        return d;
    }
    
    function draw_cotton_exports_graph() {
        var margin = {top: 0, right: 15, bottom: 25, left: 50};
        var width = $d3_cotton_exports.width() - margin.left - margin.right;
        var height = 350 - margin.top - margin.bottom;
        var x, y;
        
        // remove placeholder image if it exists
        $d3_cotton_exports.find('img').remove();
        
        x = d3.time.scale()
            .range([0, width]);

        y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10()
            .domain(d3.keys(d3_cotton_exports_data[0]).filter(function(key) { return key !== "year"; }));
        // more: https://github.com/mbostock/d3/wiki/Ordinal-Scales#wiki-category10

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
            
        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
        
        var y_axis_grid = function() { return yAxis; }
        
        var line = d3.svg.line()
//            .interpolate("basis")
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.exports); });
        
        var legend = d3.select('#cotton-exports-d3').append('ul')
                .attr('class', 'key')
            .selectAll('g')
                .data(color.domain().slice())
            .enter().append('li')
                .attr('class', function(d, i) { return 'key-item key-' + i; });

        legend.append('b')
            .style('background-color', color);

        legend.append('label')
            .text(function(d) { return d; });


        var svg = d3.select('#cotton-exports-d3').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
        var countries = color.domain().map(function(country) {
            return {
                country: country,
                values: d3_cotton_exports_data.map(function(d) {
                    return {
                        year: d.year, 
                        exports: +d[country]
                    };
                })
            };
        });

        x.domain(d3.extent(d3_cotton_exports_data, function(d) { return d.year; }));

        y.domain([
            d3.min(countries, function(c) { return d3.min(c.values, function(v) { return v.exports; }); }),
            d3.max(countries, function(c) { return d3.max(c.values, function(v) { return v.exports; }); })
        ]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + height + ")")
            .call(x_axis_grid()
                .tickSize(-height, 0, 0)
                .tickFormat("")
            );

        svg.append("g")
            .attr("class", "y grid")
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );

        var country = svg.selectAll(".country")
            .data(countries)
            .enter().append("g")
            .attr("class", "country");

        country.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.country); });
    }
    
    function reset_cotton_exports_graph() {
        if (d3.select('#cotton-exports-d3').select('svg')[0][0] != null) {
            d3.select('#cotton-exports-d3').selectAll('svg').remove();
            d3.select('#cotton-exports-d3').selectAll('.key').remove();
            draw_cotton_exports_graph();
        }
    }


	/* 
	 * Setup functions 
	 */
    function setup() {
        window_width = $w.width();
        window_height = $w.height();

        $b.addClass('chapter-' + chapters[0]);

        // setup chapter layers and navigation
        for (var i = 0; i < chapters.length; i++) {
			setup_chapters(chapters[i]);
            setup_chapter_nav(chapters[i], i);
            setup_video_question(chapters[i], i);
        }
        $video_wrapper.fitVids();
        
        // css animations
        setup_css_animations();
        
        load_graphics();

        $(window).on('resize', on_resize);
        on_resize();
        
//        goto_chapter(1);
    }
    setup();

});
