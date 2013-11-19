$(document).ready(function() {
    // cached objects
    var $b = $('body');
    var $w = $(window);
    var $btn_next = $('.btn-next-chapter');
    var $filmstrip_cotton = $('#boxes').find('.filmstrip-wrapper');
    var $filmstrip_cotton_wrapper = $('#boxes').find('.filmstrip-outer-wrapper');
    var $layers = $('.layer');
    var $layer_media = $('.layer-media');
    var $nav = $('nav');
    var $nav_btn = $nav.find('h3.btn-chapter');
    var $nav_item_wrapper = $nav.find('.nav-item-wrapper');
    var $nav_chapter_title = $('#nav-chapter-title');
    var $nav_chapter_title_prompt = $('#nav-chapter-title-prompt');
    var $titlecard = $('.titlecard');
    var $video_wrapper = $('.video-wrapper');
    var $video_inner_wrapper = $('.video-inner-wrapper');
    var $title_video;

    // static vars
    var video_aspect_width = 16;
    var video_aspect_height = 9;
    var graphic_aspect_width = 9;
    var graphic_aspect_height = 6;
    var filmstrip_cotton_aspect_width = 720;
    var filmstrip_cotton_aspect_height = 528;
    var chapters = [ 'title', 'cotton', 'machines', 'people', 'boxes', 'you', 'about' ];
    var nav_height = 74;
    var nav_height_open = 248;
    var small_nav_height = 54;
    var small_nav_height_open = 328;
    var video_advance_cuepoint = 5;
    
    // status vars
    var autoplay_video = false;
    var current_chapter_id = 0;
    var current_chapter = chapters[current_chapter_id];
    var is_touch = Modernizr.touch;
    var supports_html5_video = Modernizr.video;
    var text_scrolled = false;
    var window_width;
    var window_height;

    // data vars
    var $d3_apparel_wages = $('#apparel-wages-d3');
    var $d3_tshirt_phase = $('#tshirt-phase-d3');
    var d3_apparel_wages_data;
    var d3_tshirt_phase_data;
    
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
        w_optimal = (window_height * video_aspect_width) / video_aspect_height;
        
        // calculate optimal height if width is constrained to window width
        h_optimal = (window_width * video_aspect_height) / video_aspect_width;
        
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
        
		$title_video.width(w + 'px').height(h + 'px');
		$title_video.css('margin', h_offset + 'px ' + w_offset + 'px');
		
        // size the chapter video: must be fully visible onscreen -- no negative margins
        w_video_optimal = ((window_height - nav_height) * video_aspect_width) / video_aspect_height;
        h_video_optimal = (window_width * video_aspect_height) / video_aspect_width;

        // size the title card
		if (window_width < screen_medium || is_touch){
			$video_inner_wrapper.width('auto').height('auto');
			//$layer_media.height('auto');
	     } else {
	     	if (w_video_optimal >= window_width) {
	            w_video = window_width;
	            h_video = h_video_optimal;
	        } else {
	            w_video = w_video_optimal;
	            h_video = window_height;
	        }
	        $video_inner_wrapper.width(w_video + 'px').height(h_video + 'px');
			$layer_media.height(window_height);
	     }
	     
	     // resize the cotton filmstrip
	     size_filmstrip();

		 /* if (is_touch){
            $nav.removeAttr('data-spy').removeClass('affix');
        } else {
            $nav.attr('data-spy', 'affix');
            
            $nav.attr('data-offset-top', (window_height - nav_height));
        }
        */
        
        // redraw the charts
        draw_charts();
    }
    
    function waypoint_explainer() {
        //toggle next chapter nav and explainer prompt
        $('#' + current_chapter + ' .explainer').waypoint(function(direction) {
            if (direction == 'down') {
                console.log(current_chapter + ' waypoint down');
                $nav_chapter_title_prompt.addClass('waypoint-hide');
                $nav_chapter_title.addClass('waypoint-show animated fadeIn');
            } else {
                $nav_chapter_title_prompt.removeClass('waypoint-hide');
                $nav_chapter_title.removeClass('waypoint-show animated fadeIn');
            }
        }, { offset: '85%' } );
    }
    
    
    function goodbye_waypoint() {
    	console.log('goodbye');
	    $('#' + current_chapter + ' .explainer').waypoint('disable');
    }
    
    function hello_waypoint() {
    	console.log('hello');
	    $('#' + current_chapter + ' .explainer').waypoint('enable');
    }
    
    function setup_chapters(chapter) {
		var $chapter = $('#' + chapter);
		var $btn_play = $chapter.find('.btn-play');
		var $btn_explain = $chapter.find('.btn-explainer-prompt');

    	if (chapter != 'about') {
			$btn_play.on('click', function() {
				console.log(chapter + ' play button clicked');
				var $this_iframe = $('#video-' + current_chapter)[0];
				var $this_player = $f($this_iframe);
				
				$this_player.api('play');
                $chapter.removeClass('video-loaded').addClass('video-playing');

				if (!is_touch) {
    				$('#' + current_chapter).find('.video-wrapper').addClass('animated fadeIn backer');
    			}
				close_nav();
			});
			
			$btn_explain.on('click', function() {
				scroll_to_explainer();
			});
		} else { // about
		    // do something else?
		}
		
		// append titlecard videos, where applicable
        if (COPY[chapter] != undefined) {
            if (COPY[chapter]['loop_video_mp4'].length > 0 && !is_touch && supports_html5_video) { // desktops only
                var video_tag = '';
        
                video_tag += '<video class="title-video" poster="' + COPY[chapter]['loop_video_poster'] + '" preload="metadata" autoplay="autoplay" muted="muted">';
                video_tag += '<source src="' + COPY[chapter]['loop_video_mp4'] + '" type="video/mp4">';
                video_tag += '<source src="' + COPY[chapter]['loop_video_webm'] + '" type="video/webm">';
                video_tag += '</video>';
            
                $chapter.find('.layer-media').prepend(video_tag);
                $chapter.find('.title-video').get(0).pause();
            }
        }
    }
    
    function replace_iframe(video, url) {
        /* feature detection: http://stackoverflow.com/questions/700499/change-iframe-source-in-ie-using-javascript */
        var this_video = document.getElementById(video);

        if (this_video != null) {
            if (this_video.src) {
                this_video.src = url;
            } else if (this_video.contentWindow != null && this_video.contentWindow.location != null) {
                this_video.contentWindow.location = url;
            } else {
                this_video.setAttribute('src', url);
            }
        }
    }
    
    function setup_video(chapter) {
        // remove existing videos
        $layers.removeClass('video-loaded').removeClass('video-playing');
        for (var i = 0; i < chapters.length; i++) {
            replace_iframe('video-' + chapters[i], '');
            
        }

        text_scrolled = false;
        
        if (chapter != 'about') {
        	// add new video (if this is a chapter that has video
            var video_path = 'http://player.vimeo.com/video/' + COPY[chapter]['vimeo_id'] + '?title=0&amp;byline=0&amp;portrait=0&amp;loop=0&amp;api=1&amp;player_id=video-' + chapter;
            replace_iframe('video-' + chapter, video_path);

            var $iframe = $('#video-' + chapter)[0];
            var $player = $f($iframe);
            
            var player_ready = false;
            
            $player.addEvent('ready', function() {
                console.log(chapter + ' player ready. autoplay: ' + autoplay_video);
                $('section.show').addClass('video-loaded');
            
                // check play progress
                if (chapter != 'title') {
                    $player.addEvent('playProgress', function() {
                        // skip ahead to the explainer text at a particular cuepoint
                        $player.api('getCurrentTime', function(time) {
                            $player.api('getDuration', function(duration) {
                                if ((duration - time <= video_advance_cuepoint) && (duration > 0) && text_scrolled == false ) {
                                    scroll_to_explainer();
                                    console.log(time + '/' + duration);
                                    text_scrolled = true;
                                }
                            });
                        });
                    });
                }
                
                //show question at the end of a video
                $player.addEvent('finish', function() {
                    console.log('video finished');
                    if (chapter == 'title') {
                        hasher.setHash(chapters[1]);
                    }
                    // reset so that the autoscroll will work if the video is played again
                    text_scrolled = false;
                });
        
                if (autoplay_video && !is_touch) {
                    $('section.show').find('.btn-play').trigger('click');
                    autoplay_video = false;
                }
            });
            $('#' + chapter).find('.video-wrapper').fitVids();
        }
    }
    
	/*
	 * Chapter navigation
	 */
	function setup_chapter_nav(chapter, id) {
        $('.nav-' + chapter).on('click', function() {
            hasher.setHash(chapters[id]);
            close_nav();
			scroll_to_top();
        });
	}
	
	function get_chapter_id(chapter_name) {
	    var chapter_id;
	    
        for (var i = 0; i < chapters.length; i++) {
            if (chapter_name == chapters[i]) {
                chapter_id = i;
                break;
            }
        }
        return chapter_id;
	}
	
	function get_chapter_name(chapter_id) {
	    return chapters[chapter_id];
	}
	
    function goto_chapter(new_hash){
        var new_chapter_id;
        var new_chapter_name;
        
        if (new_hash.length == 0) {
            new_chapter_id = 0;
            new_chapter_name = chapters[new_chapter_id];
            hasher.replaceHash(chapters[new_chapter_id]);
        } else {
            // check if this is a legit hash
            new_chapter_id = get_chapter_id(new_hash);
            
            if (new_chapter_id != null && new_chapter_id != undefined) {
                new_chapter_name = new_hash;
            } else {
                new_chapter_id = 0;
                new_chapter_name = chapters[new_chapter_id];
                hasher.replaceHash(chapters[new_chapter_id]);
            }
        }
        
        console.log('new chapter: ' + new_chapter_name);

	    // set global vars
	    current_chapter = new_chapter_name;
	    current_chapter_id = new_chapter_id;

	    // goto that chapter
	    $layers.removeClass('show');
	    $('#' + new_chapter_name).addClass('show');
	    $( '#nav-chapter-title' ).removeClass( "waypoint-show" );
	    
	        
	    // add a class to the body tag indicating what chapter we're in
	    for (var i = 0; i < chapters.length; i++) {
	        var this_chapter_name = chapters[i];
	        var this_chapter_class = 'chapter-' + this_chapter_name;

	        if (i == new_chapter_id) {
                $b.addClass(this_chapter_class);

                if (this_chapter_name != 'title' && this_chapter_name != 'about') {
                    if (this_chapter_name == 'you'){ $nav_chapter_title.html(''); }
                    else {
	                    $nav_chapter_title.html('<strong>next chapter:<\/strong> ' + COPY[chapters[(new_chapter_id + 1)]]['fullname'] + '<i class="ico-right-arrow"></i>');
                    }
                    $nav_chapter_title_prompt.find('h4').text(COPY[this_chapter_name]['nav_prompt']);
                    console.log(COPY[this_chapter_name]['nav_prompt']);
                    waypoint_explainer();
                } else {
                    $nav_chapter_title.html('');
                    $nav_chapter_title_prompt.find('h4').text('');
                }

            } else {
                $b.removeClass(this_chapter_class);
            }
	    }
	    
	    // init video
        setup_video(new_chapter_name);
	    
	    // load graphics for this particular chapter
	    draw_charts();
	    
	    // reset the layers, stop any video that's playing
	    if (!is_touch) {
            $video_wrapper.removeClass('animated').removeClass('fadeOut').removeClass('backer');
        }
        
        // stop titlecard videos for all chapters but this one
        $('.title-video').each(function(k, v) {
            var this_title_chapter = $('.title-video:eq(' + k + ')').parents('section').attr('id');
            
            if (this_title_chapter == new_chapter_name) {
                v.play();
                console.log(this_title_chapter);
            } else {
                v.pause();
            }
        });
        
        // make sure the filmstrips are the right size
        switch(new_chapter_name) {
            case 'boxes':
                size_filmstrip()
                break;
        }

	    //reset the prompt for each chapter $( '#nav-chapter-title-prompt' ).css( 'display', 'block' );
	    
	    // scroll page to the top
        scroll_to_top();
        
        // close the chapter nav
        close_nav();
	}

	function close_nav() {
	    if ($nav.hasClass('slideInUp')) {
            $nav.removeClass('slideInUp').addClass('animated slideOutDown');
            $nav_item_wrapper.removeClass('backer');
        }
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
	
	function goto_next_chapter() {
        var next_chapter = chapters[( current_chapter_id + 1)];
	    console.log('advancing to chapter: ' + next_chapter);
	    hasher.setHash(next_chapter);
    }
	
	$btn_next.on('click', goto_next_chapter);
	$nav_chapter_title.on('click', goto_next_chapter);
	

	/*
	 * Explainer text
	 */
    function scroll_to_explainer() {
        var scroll_target = '#' + current_chapter + ' .explainer';

        $.smoothScroll({
        	speed: 2100,
            scrollTarget: scroll_target
        });
    }

    $nav_chapter_title_prompt.find('h4').on('click', scroll_to_explainer);

    function scroll_to_top() {
        var scroll_target = '#' + current_chapter;

        $.smoothScroll({
        	speed: 10,
            scrollTarget: scroll_target,
            /*afterScroll: function() {
				console.log('after scroll');
			}*/
        });
    }


    /*
     * Setup CSS animations
     */
    function setup_css_animations() {
        var prefixes = [ '-webkit-', '-moz-', '-o-', '' ];
        var keyframes = '';
        var filmstrip_steps = 25;
        
        var this_nav_height;
        var this_nav_height_open;
        
        if (window_width < screen_small && is_touch){
        	this_nav_height = small_nav_height;
        	this_nav_height_open = small_nav_height_open;
        } else {
        	this_nav_height = nav_height;
        	this_nav_height_open = nav_height_open;
        }
        
    	for (var i = 0; i < prefixes.length; i++) {
            keyframes += '@' + prefixes[i] + 'keyframes slideOutDown {';
            keyframes += '0% { height: ' + this_nav_height_open + 'px; }';
            keyframes += '100% { height: ' + this_nav_height + 'px; }';
            keyframes += '}';

            keyframes += '@' + prefixes[i] + 'keyframes slideInUp {';
            keyframes += '0% { height: ' + this_nav_height + 'px; }';
            keyframes += '100% { height: ' + this_nav_height_open + 'px; }';
            keyframes += '}';
            
            var filmstrip = '';
            for (var f = 0; f < filmstrip_steps; f++) {
                var current_pct = f * (100/filmstrip_steps);
                filmstrip += current_pct + '% {background-position:0 -' + (f * 100) + '%;' + prefixes[i] + 'animation-timing-function:steps(1);}';
            }
            keyframes += '@' + prefixes[i] + 'keyframes filmstrip {' + filmstrip + '}';
		}
        
        var s = document.createElement('style');
        s.innerHTML = keyframes;
        $('head').append(s);
    }
    
    
    /* 
     * Filmstrip(s) 
     */
    function size_filmstrip() {
        var filmstrip_cotton_width = $filmstrip_cotton_wrapper.width();
        var filmstrip_cotton_height = Math.ceil((filmstrip_cotton_width * filmstrip_cotton_aspect_height) / filmstrip_cotton_aspect_width);
        $filmstrip_cotton.width(filmstrip_cotton_width + 'px').height(filmstrip_cotton_height + 'px');
    }
    
    
    /*
     * D3 Charts
     */
    function load_graphics() {
        d3.tsv("data/apparel-wages.tsv", function(error, data) {
            d3_apparel_wages_data = data;
            if (current_chapter == 'people') {
                draw_apparel_wages_graph();
            }
        });

        d3.csv("data/tshirt-phase.csv", function(error, data) {
            d3_tshirt_phase_data = data;
            d3_tshirt_phase_data.forEach(function(d) {
                d.year = d3.time.format('%Y').parse(d.year);
            });
            if (current_chapter == 'people') {
                draw_tshirt_phase_graph();
            }
        });
    }
    
    function draw_apparel_wages_graph() {
        var bar_height = 25;
        var bar_gap = 10;
        var num_bars = d3_apparel_wages_data.length;
        var margin = {top: 0, right: 50, bottom: 25, left: 80};
        var width = $d3_apparel_wages.width() - margin.left - margin.right;
        var height = ((bar_height + bar_gap) * num_bars);
        
        // clear out existing graphics
        reset_charts('apparel-wages');

        // remove placeholder table if it exists
        $d3_apparel_wages.find('table').remove();
        
        var x = d3.scale.linear()
            .domain([0, d3.max(d3_apparel_wages_data, function(d) { return parseInt(d.min_wage); })])
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5);
            
        var x_axis_grid = function() { return xAxis; }

        var svg = d3.select('#apparel-wages-d3').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(x_axis_grid()
                .tickSize(-height, 0, 0)
                .tickFormat('')
            );

        svg.append('g')
            .attr('class', 'bars')
            .selectAll('rect')
                .data(d3_apparel_wages_data)
            .enter().append('rect')
                .attr("y", function(d, i) { return i * (bar_height + bar_gap); })
                .attr("width", function(d){ return x(d.min_wage); })
                .attr("height", bar_height)
                .attr('class', function(d) { return d.country.toLowerCase() });
        
        svg.append('g')
            .attr('class', 'amounts')
            .selectAll('text')
                .data(d3_apparel_wages_data)
            .enter().append('text')
                .attr('x', function(d) { return x(parseInt(d.min_wage)) })
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', 6)
                .attr('dy', 17)
                .attr('text-anchor', 'start')
                .attr('class', function(d) { return d.country.toLowerCase() })
                .text(function(d) { return '$' + d.min_wage });
        
        svg.append('g')
            .attr('class', 'country')
            .selectAll('text')
                .data(d3_apparel_wages_data)
            .enter().append('text')
                .attr('x', 0)
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', -6)
                .attr('dy', 17)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return d.country.toLowerCase() })
                .text(function(d) { return d.country });
    }
    
    function draw_tshirt_phase_graph() {
        var margin = {top: 0, right: 15, bottom: 25, left: 50};
        var width = $d3_tshirt_phase.width() - margin.left - margin.right;
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

        // clear out existing graphics
        reset_charts('tshirt-phase');

        // remove placeholder image if it exists
        $d3_tshirt_phase.find('img').remove();

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10()
            .domain(d3.keys(d3_tshirt_phase_data[0]).filter(function(key) { return key !== 'year'; }));
        // more: https://github.com/mbostock/d3/wiki/Ordinal-Scales#wiki-category10

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5);
            
        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
        
        var y_axis_grid = function() { return yAxis; }
        
        var line = d3.svg.line()
            .defined(function(d) { return (d.exports != null && d.exports != 0); })
            .interpolate('monotone')
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.exports); });
        
        var legend = d3.select('#tshirt-phase-d3').append('ul')
                .attr('class', 'key')
            .selectAll('g')
                .data(color.domain().slice())
            .enter().append('li')
                .attr('class', function(d, i) { return 'key-item key-' + i; });

        legend.append('b')
            .style('background-color', color);

        legend.append('label')
            .text(function(d) { return d; });

        var svg = d3.select('#tshirt-phase-d3').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
        var countries = color.domain().map(function(country) {
            return {
                country: country,
                values: d3_tshirt_phase_data.map(function(d) {
                    return {
                        year: d.year, 
                        exports: +d[country]
                    };
                })
            };
        });

        x.domain(d3.extent(d3_tshirt_phase_data, function(d) { return d.year; }));

        y.domain([
            d3.min(countries, function(c) { return d3.min(c.values, function(v) { return v.exports; }); }),
            d3.max(countries, function(c) { return d3.max(c.values, function(v) { return v.exports; }); })
        ]);

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

        svg.append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(x_axis_grid()
                .tickSize(-height, 0, 0)
                .tickFormat('')
            );

        svg.append('g')
            .attr('class', 'y grid')
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat('')
            );

        var country = svg.selectAll('.country')
            .data(countries)
            .enter().append('g')
            .attr('class', 'country');

        country.append('path')
            .attr('class', 'line')
            .attr('d', function(d) { return line(d.values); })
            .style('stroke', function(d) { return color(d.country); });
    }
    
    function draw_charts() {
        // only draw charts for:
        // 1) the current chapter 
        // 2) if the data has actually loaded
	    switch(current_chapter) {
	        case 'people':
	            if (d3_apparel_wages_data != undefined) {
                    draw_apparel_wages_graph();
                }
	            if (d3_tshirt_phase_data != undefined) {
                    draw_tshirt_phase_graph();
                }
	            break;
	    }
    }
    
    function reset_charts(caller) {
        if (caller != 'tshirt-phase') {
        // ^ clumsy, but i'm trying to keep graphs on the same page from zeroing each other out
            if (d3.select('#apparel-wages-d3').select('svg')[0][0] != null) {
                d3.select('#apparel-wages-d3').selectAll('svg').remove();
            }
        }
        
        if (caller != 'apparel-wages') {
            if (d3.select('#tshirt-phase-d3').select('svg')[0][0] != null) {
                d3.select('#tshirt-phase-d3').selectAll('svg').remove();
            }
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
        }
        $title_video = $('.title-video');
        
        // css animations
        setup_css_animations();

        load_graphics();

        $(window).on('resize', on_resize);
        on_resize();
        
        //add hash change listener
        hasher.changed.add(goto_chapter);
        //add initialized listener (to grab initial value in case it is already set)
        hasher.initialized.add(goto_chapter);
        //initialize hasher (start listening for history changes)
        hasher.init();
        
        //initialize waypoint
        if (!is_touch){
            
        }
        
    }
    setup();

});
