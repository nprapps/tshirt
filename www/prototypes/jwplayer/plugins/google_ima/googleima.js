
/** Creating jwplayer.googima namespace for the googima plugin. 
   All classes used by the plugin will be defined under this namespace **/

 (function(jwplayer){

    jwplayer.googima = {};
    
})(jwplayer);


/** jwplayer.googima.ParameterParser parses the ad configuration options so that they can be processed by the GoogIMA Bridge and PlayerConnector **/

(function(jwplayer){

   
    jwplayer.googima.ParameterParser = function(params,player){
    
        var _params = params;
    
        /** 
         * function parseOptions(): Parse googima configuration options provided by the publisher so that ads can be
         * appropriately classified and scheduled. Also parse optional configuration options.
         * returns a ParamStruct object, consisting of videoAds, overlayAds and optionalParameters
         **/
        this.parseOptions= function(){
            
            //Get the "ad" field of the configuration options, which contains all ads.
            var allAds = _params.ad;
            var optionalParams = {};
            
            //The videoAds and overlayAds objects have fields corresponding to ads classified by time position. 
            //The fields are all arrays of ad urls
            var videoAds = {preAds: new Array(), timeinstantAds: new Array(), timeMarkers: new Array(), interAds: new Array(),postAds: new Array()};
            var overlayAds = {preAds: new Array(), timeinstantAds: new Array(), timeMarkers: new Array(), interAds: new Array(),postAds: new Array()};
            
            //Classify the ads according the type and timing and store them accordingly
            for(i in allAds)
                {
                    //Get the current ad to be parsed
                    currAd = allAds[i];
                    
                    //Check for invalid ad types
                    if(currAd.type != 'video' && currAd.type != 'overlay')
                        {
                            if(typeof currAd.type == "undefined")
                                currAd.type = 'video';
                            else
                                throw "Error caught in ParameterParser: invalid ad type";
                        }
                    
                    
                    //If the ad tag is not a string, then it can't be a valid URL
                    if(typeof currAd.tag != "string")  
                        throw "Error caught in ParameterParser: No ad tag provided";
                    
                    //Classify each video and overlay ad, first according to type, then according to time position.
                    switch(currAd.position)
                    {
                    
                        case 'pre':
                          if(currAd.type == 'video')
                            videoAds.preAds.push({id: i, tag: currAd.tag});
                          else 
                            overlayAds.preAds.push({id: i, tag: currAd.tag});
                        continue;
                        
                        case 'inter':
                          if(currAd.type == 'video')
                            videoAds.interAds.push({id: i, tag: currAd.tag});
                          else 
                            overlayAds.interAds.push({id: i, tag: currAd.tag});
                        continue;
                        
                        case 'post':
                          if(currAd.type == 'video')
                            videoAds.postAds.push({id: i, tag: currAd.tag});
                          else 
                            overlayAds.postAds.push({id: i, tag: currAd.tag});
                        continue;
                        
                        default:
                          if(typeof currAd.position == "undefined")
                            throw "Error caught in ParameterParser: no ad position provided";
                          else if(!isNaN(parseInt(currAd.position)) && parseInt(currAd.position)!=0)
                                {
                                    if(currAd.type == 'video')
                                    {
                                        videoAds.timeinstantAds.push({id: i, tag: currAd.tag});
                                        videoAds.timeMarkers.push(currAd.position);
                                    }
                                    else
                                    {
                                        overlayAds.timeinstantAds.push({id: i, tag: currAd.tag});
                                        overlayAds.timeMarkers.push(currAd.position);
                                    }
                                }
                            else if(!isNaN(parseInt(currAd.position.split(":")[0])) && !isNaN(parseInt(currAd.position.split(":")[1])))
                                {
                                    if(currAd.type == 'video')
                                    {
                                        videoAds.timeinstantAds.push({id: i, tag: currAd.tag});
                                        videoAds.timeMarkers.push(currAd.position);
                                    }
                                    else
                                    {
                                        overlayAds.timeinstantAds.push({id: i, tag: currAd.tag});
                                        overlayAds.timeMarkers.push(currAd.position);
                                    }
                                
                                }
                        else
                            {
                                throw "Error caught in ParameterParser: invalid ad position";
                                break;
                            }
                        continue;
                               
                        
                    }
                
                }
                
            
            for (x in videoAds)
            {
                videoAds[x].reverse();
            }
            
            for (x in overlayAds)
            {
                overlayAds[x].reverse();
            }
            
            //Check if optional parameters are defined. If not, set to default.
            
            
            
            if(typeof params.admessagestatic == "undefined")
                optionalParams.admessagestatic = "This is an Advertisement";
            else
                optionalParams.admessagestatic = params.admessagestatic;

            if(typeof params.usestaticmessage == "undefined")
                optionalParams.usestaticmessage = false;
            else
                optionalParams.usestaticmessage = _parseType(params.usestaticmessage);
            
            if(typeof params.admessagedynamic == "undefined")
                optionalParams.admessagedynamic = "Your Ad will close in XX seconds";
            else
                optionalParams.admessagedynamic = params.admessagedynamic;

            if(typeof params.admessagedynamickey == "undefined")
                optionalParams.admessagedynamickey = "XX";
            else
                optionalParams.admessagedynamickey = params.admessagedynamickey;
                    
            if(typeof params.adcounterdynamic == "undefined")
                optionalParams.adcounterdynamic = "Ad X of Y";
            else
                optionalParams.adcounterdynamic = params.adcounterdynamic;
                    
            if(typeof params.adcountercountkey == "undefined")
                optionalParams.adcountercountkey = "X";
            else
                optionalParams.adcountercountkey = params.adcountercountkey;
                    
            if(typeof params.adcountertotalkey == "undefined")
                optionalParams.adcountertotalkey = "Y";
            else
                optionalParams.adcountertotalkey = params.adcountertotalkey;
                    
            if(typeof params.click_tracking == "undefined")
                optionalParams.click_tracking = true;
            else
                optionalParams.click_tracking = _parseType(params.click_tracking);
                    
            if(typeof params.scaled_ads == "undefined")
                optionalParams.scaled_ads = true;
            else
                optionalParams.scaled_ads = _parseType(params.scaled_ads);
                    
            if(typeof params.advideoheight == "undefined")
                optionalParams.advideoheight = 0;
            else
                optionalParams.advideoheight = _parseType(params.advideoheight);
                    
            if(typeof params.advideowidth == "undefined")
                optionalParams.advideowidth = 0;
            else
                optionalParams.advideowidth = _parseType(params.advideowidth);
            
            if(typeof params.invertmutebutton == "undefined")
                optionalParams.invertmutebutton = false;
            else
                optionalParams.invertmutebutton = _parseType(params.invertmutebutton);
                
            if(typeof params.allowadskip == "undefined")
                optionalParams.allowadskip = false;
            else
                optionalParams.allowadskip = _parseType(params.allowadskip);    
                
            if(typeof params.allowadskippastseconds == "undefined")
                optionalParams.allowadskippastseconds = 0;
            else
                optionalParams.allowadskippastseconds = _parseType(params.allowadskippastseconds);
                    
            if(typeof params.allowplayercontrols == "undefined")
                optionalParams.allowplayercontrols = false;
            else
                optionalParams.allowplayercontrols = _parseType(params.allowplayercontrols);
            
            if(typeof params.allowvolumeslider == "undefined")
                optionalParams.allowvolumeslider = false;
            else
                optionalParams.allowvolumeslider = _parseType(params.allowvolumeslider);
                
            if(typeof params.companionDiv != "undefined")
                optionalParams.companionDiv = params.companionDiv;
        
            //ASK GOOGLE ABOUT THIS PROBLEM
            if(typeof params.overlayslotwidth == "undefined")
                optionalParams.overlayslotwidth = 0;
            else
                optionalParams.overlayslotwidth = _parseType(params.overlayslotwidth);
                
            if(typeof params.overlayslotheight== "undefined")
                optionalParams.overlayslotheight = 0;
            else
                optionalParams.overlayslotheight = _parseType(params.overlayslotheight);
            
            
            //Create object that stores parameters. If parameter formats are invalid (data type checked only), then the ParamStruct will throw an error 
            try
            {
                var parsedParams = new jwplayer.googima.ParamStruct(videoAds, overlayAds, optionalParams); 
                return parsedParams;
            }
            catch(er)
            {
                throw "Error caught in ParamStruct: " + er;
            }
    
        };
        
        //function _parseType(param): If param (expected boolean or number) is provided in string form (e.g. "true" or "1" instead of true or 1), convert to wanted type
        function _parseType(param){
            
            if(param == "true")
                return true;
            else if(param == "false")
                return false;
            else if(!isNaN(parseInt(param,10)))
                return parseInt(param,10);
            else 
                return param;
                
        }
    
        
        
        
    };
    

})(jwplayer);

/**jwplayer.googima.ParamStruct stores the parsed configuration options in a palatable form for GoogIMA Bridge and PlayerConnector**/
(function(jwplayer){

    
    jwplayer.googima.ParamStruct = function(videoAds, overlayAds, optionalParams){

        var videoAds = videoAds;
        var overlayAds = overlayAds;
        var optionalParams = optionalParams;    
        
        
        //Checking for valid input
        if(typeof videoAds != "object" || typeof overlayAds != "object" || typeof optionalParams != "object")
           throw "arg not obj";

        
        /**
        * function _isStringArray(adArray): returns true if adArray is an array exclusively of strings, false otherwise. 
        * This function is used to determine if all ad tags provided are strings. 
         **/
        /* 
        function _isStringArray(adArray){
        
                if(adArray.constructor.toString().indexOf("Array") == -1)
                   return false;
                else
                {
                    for(i = 0; i < adArray.length; i++)
                    {
                        if(typeof adArray[i] != "string")
                            return false;
                    }
                
                }
                
                return true;
        };
        */
        //Check if all ad tags are string arrays
        for(x in videoAds)
        {
            if(x != "timeMarkers")
            {
                for(count = 0; count < videoAds[x].length; count++)
                {
                var theadnow = videoAds[x][count];
                if(typeof theadnow.id == "undefined" || typeof theadnow.tag == "undefined" || typeof theadnow.tag != 'string' )
                    throw "ad tags should be all strings";
                }
            }
        }
        
        for(x in overlayAds)
        {
            if(x != "timeMarkers")
            {
                for(count = 0; count < overlayAds[x].length; count++)
                {
                var theadnow = overlayAds[x][count];
                if(typeof theadnow.id == "undefined" || typeof theadnow.tag == "undefined" || typeof theadnow.tag != 'string' )
                    throw "ad tags should be all strings";
                }
            }
    
        }

        for(var i = 0; i < videoAds['timeMarkers'].length; i++)
        {
            var marker = videoAds['timeMarkers'][i];
            if(!isNaN(parseInt(marker)) && parseInt(marker)!= 0)
                videoAds['timeMarkers'][i] = parseInt(marker,10);
            else
                videoAds['timeMarkers'][i] = parseInt(marker.split(":")[0]*60,10) + parseInt(marker.split(":")[1],10);  
        
        }
        
        for(var i = 0; i < overlayAds['timeMarkers'].length; i++)
        {
            var marker = overlayAds['timeMarkers'][i];
            if(!isNaN(parseInt(marker)) && parseInt(marker)!= 0)
                overlayAds['timeMarkers'][i] = parseInt(marker,10);
            else
                overlayAds['timeMarkers'][i] = parseInt(marker.split(":")[0]*60,10) + parseInt(marker.split(":")[1],10);    
        
        }
    
        
        var timeinstantAds = videoAds['timeinstantAds'];
        timeinstantAds.sort(function(tag1,tag2)
                            {
                                return videoAds['timeMarkers'][timeinstantAds.indexOf(tag1)] - videoAds['timeMarkers'][timeinstantAds.indexOf(tag2)];
                            });
        videoAds['timeMarkers'].sort();
        
        var timeinstantAds = overlayAds['timeinstantAds'];
        timeinstantAds.sort(function(tag1,tag2)
                            {
                                return overlayAds['timeMarkers'][timeinstantAds.indexOf(tag1)] - overlayAds['timeMarkers'][timeinstantAds.indexOf(tag2)];
                            });
        overlayAds['timeMarkers'].sort();
        
        videoAds['timeMarkers'].reverse();
        videoAds['timeinstantAds'].reverse();
        overlayAds['timeMarkers'].reverse();
        overlayAds['timeinstantAds'].reverse();
        
        //Check if all Optional Parameters are of the appropriate data type
        
        if(typeof optionalParams.admessagestatic != "undefined" && typeof optionalParams.admessagestatic != 'string' )
            throw "invalid parameter: admessagestatic should be a string";
            
        if (typeof optionalParams.usestaticmessage != "undefined" && typeof optionalParams.usestaticmessage != 'boolean')       
            throw "invalid parameter: usestaticmessage should be a boolean";
            
        if (typeof optionalParams.admessagedynamic != "undefined" && typeof optionalParams.admessagedynamic != 'string' )
            throw "invalid parameter: admessagedynamic should be a string";
            
        if (typeof optionalParams.admessagedynamickey != "undefined" && typeof optionalParams.admessagedynamickey != 'string' )
            throw "invalid parameter: admessagedynamickey should be an Object";
            
        if (typeof optionalParams.adcounterdynamic != "undefined" && typeof optionalParams.adcounterdynamic != 'string' )
            throw "invalid parameter: adcounterdynamic should be a string";
            
        if (typeof optionalParams.adcountercountkey != "undefined" && typeof optionalParams.adcountercountkey != 'string')
            throw "invalid parameter: adcountercountkey should be a string";
            
        if (typeof optionalParams.adcountertotalkey != "undefined" && typeof optionalParams.adcountertotalkey != 'string' )
            throw "invalid parameter: adcountertotalkey should be an Object";
            
        if (typeof optionalParams.click_tracking != "undefined" && typeof optionalParams.click_tracking != 'boolean' )
            throw "invalid parameter: click_tracking should be a boolean";
            
        if (typeof optionalParams.scaled_ads != "undefined" && typeof optionalParams.scaled_ads != 'boolean' )      
            throw "invalid parameter: scaled_ads should be a boolean";
            
        if (typeof optionalParams.advideoheight != "undefined" && typeof optionalParams.advideoheight != 'number' )
            throw "invalid parameter: advideoheight should be a number";
        
        if (typeof optionalParams.advideowidth != "undefined" && typeof optionalParams.advideowidth != 'number' )
             throw "invalid parameter: advideowidth should be a number";
        
        if (typeof optionalParams.invertmutebutton != "undefined" && typeof optionalParams.invertmutebutton != 'boolean')
             throw "invalid parameter: invertmutebutton should be a boolean";
             
        if (typeof optionalParams.allowadskip != "undefined" && typeof optionalParams.allowadskip != 'boolean' )
             throw "invalid parameter: allowadskip should be a boolean";
        
        if (typeof optionalParams.allowadskippastseconds != "undefined" && typeof optionalParams.allowadskippastseconds != 'number' )
             throw "invalid parameter: allowadskippastseconds should be a number";
             
        if (typeof optionalParams.allowplayercontrols != "undefined" && typeof optionalParams.allowplayercontrols != 'boolean' )
             throw "invalid parameter: allowplayercontrols should be a boolean";
             
        if (typeof optionalParams.allowvolumeslider != "undefined" && typeof optionalParams.allowvolumeslider != 'boolean' )
             throw "invalid parameter: allowvolumeslider should be a boolean";
        
        if (typeof optionalParams.companionDiv != "undefined" && typeof optionalParams.companionDiv != 'string' )
             throw "invalid parameter: companionDiv should be a string";
        
        if (typeof optionalParams.overlayslotwidth != "undefined" && typeof optionalParams.overlayslotwidth != 'number')
            throw "invalid parameter: overlayslotwidth should be a number";
            
        if (typeof optionalParams.overlayslotheight != "undefined" && typeof optionalParams.overlayslotheight != 'number')
            throw "invalid parameter: overlayslotheight should be a number" 
        
    
        //Public Methods to return COPIES of instance variables
    
        this.videoAds = function(){
           
           var tempvideoAds = {};
        
            for(x in videoAds)
            {
                tempvideoAds[x] = videoAds[x].slice(0);
            }
        
            return tempvideoAds;
        };
        
        this.overlayAds = function(){

            var tempoverlayAds = {};
        
            for(x in overlayAds)
            {
                tempoverlayAds[x] = overlayAds[x].slice(0);
            }
        
            return tempoverlayAds;
     
        };  
         
        this.optionalParams = function(){
            
            return optionalParams;
         
        };
         
    };

})(jwplayer);

/**The jwplayer.googima.GoogIMABridge class interacts with the Google IMA SDK to request video or overlay ads and play them.**/

(function(jwplayer){

    jwplayer.googima.GoogIMABridge = function(optionalParams, player, playerConnect, controller){

    
        jwplayer.googima.GoogIMABridge.ADSTART = "adStart";
        jwplayer.googima.GoogIMABridge.VIDEOADLOADED = "videoAdLoaded";
        jwplayer.googima.GoogIMABridge.OVERLAYADLOADED = "overlayAdLoaded";
        jwplayer.googima.GoogIMABridge.ADCOMPLETE = "adComplete";
        jwplayer.googima.GoogIMABridge.ADERROR = "adError";
        jwplayer.googima.GoogIMABridge.ADLOADERROR = "adLoadError";
        jwplayer.googima.GoogIMABridge.OVERLAYDISPLAYED = "overlayDisplayed";
        //Optional Parameters to be processed when adding event handlers for ads
        var optParams = optionalParams;
        var _player = player;
        var _playerConnect = playerConnect;
        var _controller = controller;
        //The GoogIMABridge object needs to send events when an ad is skipped or complete, 
        //so that certain methods (such as unloading assets, or moving ahead with the schedule)
        //can be called by the PlayerConnector object. Hence, GoogIMABridge extends the EventDispatcher class.
        
        var eventDispatcher = new jwplayer.googima.EventDispatcher();
        jwplayer.utils.extend(this, eventDispatcher);
        
        //Trigger Variable adPlaying. Set to true when an ad starts playing, set to false when an ad finishes.
        
        var adSkipped = false;
        var adsLoader = {};
        var adsManager = {};
    
        
        /** 
         * function requestAds(tag,type): Request Ads by interacting with the GoogIMA for HTML5 SDK. 
         **/        
        this.requestAds = function(tag,type){ 
            //Check for invalid ad type
            if(type != "video" && type != "overlay")
                throw "Error caught in GoogIMABridge: Invalid Ad Type";
            else
                {
                    //Create Ads Loader object (provided by Google SDK)
                    adsLoader = new google.ima.AdsLoader();
                
                
                    //Ad Event Listeners/Handlers for ad loading and ad errors
                    if(type == "video")
                        adsLoader.addEventListener(google.ima.AdsLoadedEvent.Type.ADS_LOADED,_onVideoAdLoaded, false);
                    else
                        adsLoader.addEventListener(google.ima.AdsLoadedEvent.Type.ADS_LOADED,_onOverlayAdLoaded, false);
                    
                    adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,_onAdError);
               
                    //Request the ad from Google
                    
                    adsLoader.requestAds({adTagUrl: tag, adType: type});
                
                }   
           
            
            
          
          };
        
         //When the video ad requested by the AdsLoader is loaded, _onVideoAdLoaded is the callback to process and play it
         function _onVideoAdLoaded(adsLoadedEvent){

            //get adsManager object from SDK 
            adsManager = adsLoadedEvent.getAdsManager();
            eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.VIDEOADLOADED);
            adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, _onAdStart);
            adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, _onAdComplete);
            adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, _onAdError);
            adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,_onPauseRequested);
            adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,_onResumeRequested);
            //Set Click Tracking element 
            if(optParams.click_tracking)
            {
                adsManager.setClickTrackingElement(document.getElementById(player.id + "_clickdiv"));
            }
            
            try {
                
                // Call play to start showing the ad.
                adsManager.play(_playerConnect.getVideoTag());
                    
            } catch (adError) {
            
                jwplayer.utils.log(adError);
                // An error may be thrown if there was a problem with the VAST response.
            
            }
            
            function _onPauseRequested() {
                
                //When an ad is requested, the currently playing video (if any) must be paused.
                _playerConnect.getVideoTag().pause();
            };

            function _onResumeRequested() {
            
              //Called when ad is skipped and content should be resumed. 
                _playerConnect.getVideoTag().play();
            };
            
            
            //Get and display Companion Ads
            try {
                _manageCompanionAd();
            } catch(error) {
                jwplayer.utils.log(error);
            }
            
         };
        
        /** 
         * function onAdComplete(): unloads ad assets, sets the adPlaying trigger variable to false, and sends the Ad Complete event
         **/
         
        function _onAdStart(){
            
            eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.ADSTART);
        };
        
        function _onAdComplete(){               
                //Unload assets when ad is complete
                adsManager.unload();
                eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.ADCOMPLETE);
                
        };
        
        this.onAdDismissed = function(){
        
            if(typeof adsManager.unload != 'undefined')
                adsManager.unload();
        };
        function _onAdLoadError(adErrorEvent) {
         
            eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.ADLOADERROR);
            jwplayer.utils.log(adErrorEvent);

        }; 
        //When the overlay ad requested by the AdsLoader is loaded, _onOverlayAdLoaded is the callback to process and play it 
        function _onOverlayAdLoaded(adsLoadedEvent){
         
            if(!_controller.adPlaying())
            {
                eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.OVERLAYADLOADED);
                
                
                //get adsManager object from SDK 
                adsManager = adsLoadedEvent.getAdsManager();
                
                
                //Ad event listener to deal with Ad Errors
                adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, _onAdError); 
                
                //Set ad slot width and height
                adsManager.setAdSlotWidth(_player.getWidth());
                
                adsManager.setAdSlotHeight(_player.getHeight());
                
                // Set Alignment
                adsManager.setHorizontalAlignment(google.ima.AdSlotAlignment.HorizontalAlignment.CENTER);
                adsManager.setVerticalAlignment(google.ima.AdSlotAlignment.VerticalAlignment.CENTER);
                
            
                //Fetch the ad and companion ads
                adsManager.play(document.getElementById(_player.id + "_overlayAd"));
                eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.OVERLAYDISPLAYED);
                
                try {
                    _manageCompanionAd();
                } catch(error) {
                    jwplayer.utils.log(error);
                }
            
            
            } 
        };
     
     
        
        //Logs an Ad Load Error
        
    
        //Logs an Error that occurs while playing the ad/after the ad has been played
        function _onAdError(adErrorEvent) {
            
            eventDispatcher.sendEvent(jwplayer.googima.GoogIMABridge.ADERROR)
            jwplayer.utils.log(adErrorEvent);
            
        };
         
        //Logs an overlay Ad error. Hides Overlay Slot if Error Occurs, so as to not disturb viewer. 
        
        
        
        
         
        function _manageCompanionAd(){
         
              // Ideally, there should be a configuration option for companion Ad dimensions
            if(typeof optParams.companionDiv != "undefined")
            {
                 if(optParams.companionDiv != "")
                 {
                      var ad = adsManager.getAds()[0];
                      // Get a list of companion ads for an ad slot size and CompanionAdSelectionSettings
                      var companionAds = ad.getCompanionAds(parseInt(document.getElementById(optParams.companionDiv).style["width"].substring(0,document.getElementById(optParams.companionDiv).style.width.indexOf("p"))),
                                                            parseInt(document.getElementById(optParams.companionDiv).style["height"].substring(0,document.getElementById(optParams.companionDiv).style.height.indexOf("p"))),
                                                            {resourceType: google.ima.CompanionAdSelectionSettings.ResourceType.STATIC,
                                                             creativeType: google.ima.CompanionAdSelectionSettings.CreativeType.IMAGE});
                      var companionAd = companionAds[0];
                      // Get HTML content from the companion ad.
                      var content = companionAd.getContent();
                      // Write the content to the companion ad slot.
                      document.getElementById(optParams.companionDiv).innerHTML = content;
                 }
            }
         };
         
    };

    
    
    
})(jwplayer);//This class is the same as jwplayer.utils.eventdispatcher
//jwplayer.googima.GoogIMABridge extends this class, because of the need to send events when an ad is complete or loaded

(function(jwplayer) {
    jwplayer.googima.EventDispatcher = function(debug) {
        var _debug = debug;
        var _listeners;
        var _globallisteners;
        
        /** Clears all event listeners **/
        this.resetEventListeners = function() {
            _listeners = {};
            _globallisteners = [];
        };
        
        this.resetEventListeners();
        
        /** Add an event listener for a specific type of event. **/
        this.addEventListener = function(type, listener, count) {
            try {
                if (!jwplayer.utils.exists(_listeners[type])) {
                    _listeners[type] = [];
                }
                
                if (typeof(listener) == "string") {
                    eval("listener = " + listener);
                }
                _listeners[type].push({
                    listener: listener,
                    count: count
                });
            } catch (err) {
                jwplayer.utils.log("error", err);
            }
            return false;
        };
        
        
        /** Remove an event listener for a specific type of event. **/
        this.removeEventListener = function(type, listener) {
            if (!_listeners[type]) {
                return;
            }
            try {
                for (var listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
                    if (_listeners[type][listenerIndex].listener.toString() == listener.toString()) {
                        _listeners[type].splice(listenerIndex, 1);
                        break;
                    }
                }
            } catch (err) {
                jwplayer.utils.log("error", err);
            }
            return false;
        };
        
        /** Add an event listener for all events. **/
        this.addGlobalListener = function(listener, count) {
            try {
                if (typeof(listener) == "string") {
                    eval("listener = " + listener);
                }
                _globallisteners.push({
                    listener: listener,
                    count: count
                });
            } catch (err) {
                jwplayer.utils.log("error", err);
            }
            return false;
        };
        
        /** Add an event listener for all events. **/
        this.removeGlobalListener = function(listener) {
            if (!_globallisteners[type]) {
                return;
            }
            try {
                for (var globalListenerIndex = 0; globalListenerIndex < _globallisteners.length; globalListenerIndex++) {
                    if (_globallisteners[globalListenerIndex].listener.toString() == listener.toString()) {
                        _globallisteners.splice(globalListenerIndex, 1);
                        break;
                    }
                }
            } catch (err) {
                jwplayer.utils.log("error", err);
            }
            return false;
        };
        
        
        /** Send an event **/
        this.sendEvent = function(type, data) {
            if (!jwplayer.utils.exists(data)) {
                data = {};
            }
            if (_debug) {
                jwplayer.utils.log(type, data);
            }
            if (typeof _listeners[type] != "undefined") {
                for (var listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
                    try {
                        _listeners[type][listenerIndex].listener(data);
                    } catch (err) {
                        jwplayer.utils.log("There was an error while handling a listener: " + err.toString(), _listeners[type][listenerIndex].listener);
                    }
                    if (_listeners[type][listenerIndex]) {
                        if (_listeners[type][listenerIndex].count === 1) {
                            delete _listeners[type][listenerIndex];
                        } else if (_listeners[type][listenerIndex].count > 0) {
                            _listeners[type][listenerIndex].count = _listeners[type][listenerIndex].count - 1;
                        }
                    }
                }
            }
            for (var globalListenerIndex = 0; globalListenerIndex < _globallisteners.length; globalListenerIndex++) {
                try {
                    _globallisteners[globalListenerIndex].listener(data);
                } catch (err) {
                    jwplayer.utils.log("There was an error while handling a listener: " + err.toString(), _globallisteners[globalListenerIndex].listener);
                }
                if (_globallisteners[globalListenerIndex]) {
                    if (_globallisteners[globalListenerIndex].count === 1) {
                        delete _globallisteners[globalListenerIndex];
                    } else if (_globallisteners[globalListenerIndex].count > 0) {
                        _globallisteners[globalListenerIndex].count = _globallisteners[globalListenerIndex].count - 1;
                    }
                }
            }
        };
    };
})(jwplayer);


(function(jwplayer){

    
    jwplayer.googima.AdScheduler = function(player, params,controller, playerConnect){
    
        jwplayer.googima.AdScheduler.ADPROGRESS = "adProgress";
        jwplayer.googima.AdScheduler.ADREQUESTED = "adRequested";
        jwplayer.googima.AdScheduler.ADSCOMPLETE = "adsComplete";
        //Store Parameters
        var _params = params;
        var eventDispatcher = new jwplayer.googima.EventDispatcher();
        jwplayer.utils.extend(this, eventDispatcher);
        var _controller = controller;
        var _playerConnect = playerConnect;
        //The try block is a safeguard against the possibility of params being null and hence not having any methods
        try{
        
            var _player = player;
            var prevideos = params.videoAds().preAds;
            var numPre = prevideos.length;      
            var preoverlays = params.overlayAds().preAds;
            var timevideos = params.videoAds().timeinstantAds;
            var timeoverlays = params.overlayAds().timeinstantAds;
            var vidtimeMarkers = params.videoAds().timeMarkers;
            var overtimeMarkers = params.overlayAds().timeMarkers;
            var intervideos = params.videoAds().interAds;
            var interoverlays = params.overlayAds().interAds;
            var postvideos = params.videoAds().postAds;
            var numPost = postvideos.length;
            var postoverlays = params.overlayAds().postAds;
            var optParams = params.optionalParams();
        
        }
        catch(error)
        {
            jwplayer.utils.log(error);
        }
        
        //Store JW's original playlist
        var playlist = _playerConnect.getPlaylist();
        
        //Stores the last item to keep track of when the last video in the playlist is played.
        var lastitem = playlist[playlist.length-1];
        
        //This will be used to store the most recently played item.
        var recentlyplayed = {};
        
        //trigger variables
        var schedtrigger = false;
        var prestarted = (prevideos.length == 0) ? true : false;    
    
    
        //How many videos have been played
        var uservidsloaded = 1;
        
        //Whether or not the JW Player is detached from the video element
    
        
        //These variables are necessary to implement an optional Parameter that displays the ad number. 
        //jwplayer.googima.AdControls can access these variables through the function getAdInfo()
        var adcount = 0;
        var adtotal = 0;
        
        var listenernotset = true;
        var postplaying = false;
        
        
        
        //Trigger variables. 
        //interplayed tells us if we've already played an "inter" ad every new video, so that we don't play all the inter ads between the first two videos.
        var interplayed = false;
        
        //schedtrigger tells us if we've started our schedule (of ads,video,etc) for an individual video item, so the onPlay event handlers will be called only when the video starts
        
        
        
        
        //The following variables will be used to play the right ads at the right time, and
        // make sure there are no unnecessary ad requests either. Each time a new video is
        // played, these variables will be reset.
        
        var firstvideo = true;
        
        var vidtimeMarker = {};
        var timevideo = {};
        
        
        
        var overtimeMarker = {};
        var timeoverlay = {};
        var preoverlay = {};
        var prevideo = {};
        
        var adrequestedOver = false;
        var shownpreoverlay = false;
        var showninterover = false;
        var postplaying = false;
        var previdsfired = false;
        var postvidsfired = false;
        
        /** 
         *function _init(): Called when the object is constructed, adds event listeners for the JW Player t
         **/
        function _init(){
        
            
            _playerConnect.setPlayerEventHandlers(_onUserVideoLoad,_createAdSchedule,_playScheduledAds,_onUserVideoLoad);
            
            
        
        };
        
        
        function _onUserVideoLoad(){ 
                
            _checkforPostRolls();   
            schedtrigger = false;   
            interplayed = false;
            uservidsloaded++;
            timevideos = params.videoAds().timeinstantAds;
            timeoverlays = params.overlayAds().timeinstantAds;
            vidtimeMarkers = params.videoAds().timeMarkers;
            overtimeMarkers = params.overlayAds().timeMarkers;
        }
        
        //Sets up the Ad Order for a specific playlist item.
        function _createAdSchedule(){
            
            
                    // store currently playing item. Useful to figure out later if the playlist has finished for postrolls. 
                    // (We've stored the last playlist item before to compare it to)
                    if(listenernotset)
                    {
                        var vidTag = _playerConnect.getVideoTag();
                        vidTag.addEventListener("timeupdate", function(){
                
                        if(_playerConnect.isDetached())
                            {
                                eventDispatcher.sendEvent(jwplayer.googima.AdScheduler.ADPROGRESS); 
                            }
                        },false);
                        listenernotset = false;
                    }
                        
                    recentlyplayed = _playerConnect.getPlaylistItem();
                    
                    
                    if(!schedtrigger) // The following block figures out if there are any video ad time markers for this video
                    {
                        
                        schedtrigger = true; //schedule for individual item has been triggered.
                        
                        firstvideo = (uservidsloaded == 1) ? true : false; //Is this the first video? Used to determine whether or not to play prerolls
                        
                        //Calculate actual times from the time markers for the time-instant videos (e.g. 01:20 -> 80 seconds)
                        if(vidtimeMarkers.length > 0)
                        {
                            vidtimeMarker = vidtimeMarkers.pop();
                            timevideo = timevideos.pop();
                            
                        
                        }
                            
                        //Calculate actual times from the time markers for the time-instant overlays (e.g. 01:20 -> 80 seconds)
                        if(overtimeMarkers.length > 0)
                        {
                            overtimeMarker = overtimeMarkers.pop();
                            timeoverlay = timeoverlays.pop();
                            
                            adrequestedOver = false;
                        }
                        
                        //Schedule pre-overlays (if any) or inter overlays if this is not the first video
                        if(!shownpreoverlay && preoverlays.length != 0)
                        {
                            preoverlay = preoverlays.pop();
                            actualtimePre = 1;
                            shownpreoverlay = false;
        
                        }
                        else if(interoverlays.length != 0 && !firstvideo)
                        {
                            interoverlay = interoverlays.pop();
                            interovertime = 1;
                            showninterover = false;
                            
                        }
                        
                        
                        
                        
                        
                    }
                
                
                    
            };
        
        //Checks if the playlist is over and if so, process post-rolls
        function _checkforPostRolls(){  // This event handler is solely for the purpose of figuring out when to play postrolls
                
                if(recentlyplayed == lastitem) //Last item of playlist has just been played
                    {
                            //Start Request Post videos 
                            if(postvideos.length != 0)
                            {               
                                
                                postvideo = postvideos.pop();
                                postplaying = true;
                                adtotal = numPost;
                                adcount = numPost - postvideos.length;
                                _controller.setCurrentAd({id: postvideo.id, type:"video", position: "post", tag: postvideo.tag});
                                _makeRequest(postvideo.tag,"video");
                                postplaying = true;
                            }
                            else
                                {
                                    if(postoverlays.length != 0) {
                                    
                                        postover = postoverlays.pop();
                                        _controller.setCurrentAd = ({id: postover.id, type:"overlay", position: "post", tag: postover.tag});
                                        _makeRequest(postover.tag,"overlay");
                                        
                                    }
                                    
                                }
                        
                    }
            
            }
        
        //Attach the JW Player to the video tag after an ad is complete, and enable controls    
        this.onAdComplete = function(ad){
                
                    //reattach JW Player Event Listeners
                    if (!(ad.position == "pre" && prevideos.length != 0 || ad.position == "post" && postvideos.length != 0) && (ad.type == 'video'))
                        eventDispatcher.sendEvent(jwplayer.googima.AdScheduler.ADSCOMPLETE);
                    
                    _playerConnect.attachPlayer();
                    
                    //Show controlbar again. Show video tag controls for iOS
                    _playerConnect.showControlbar();
                    if(jwplayer.utils.isIOS())
                        playerConnect.getVideoTag().controls = true;
                                
                    //If postvideos have started playing, continue playing them (if any)            
                    if(typeof postplaying != "undefined")
                    {
                        if(postplaying)
                        {
                            if(postvideos.length != 0)
                            {               
                                postvideo = postvideos.pop();
                                postplaying = true;
                                adtotal = numPost;
                                adcount = numPost - postvideos.length;
                                _controller.setCurrentAd({id: postvideo.id, type:"video", position: "post", tag: postvideo.tag}); 
                                _makeRequest(postvideo.tag,"video");
                                postplaying = true;
                            }
                            else
                                {
                                    if(postvideos.length != 0)
                                    {
                                     postover = postoverlays.pop();
                                     _controller.setCurrentAd({id: postover.id, type:"overlay", position: "post", tag: postover.tag}); 
                                     _makeRequest(postover,"overlay");
                                    }
                                
                                }
                        }
                    }
                    
                    if(_playerConnect.getVideoTag().muted)
                        {
                            _playerConnect.mute();
                        }
            
            }
        
        //Play ads at given time instants (callback for _player.onTime())
        function _playScheduledAds(){
                        
                        
                        //Event handlers for actually Playing the ads
                        if(schedtrigger && !_controller.adPlaying()) //Schedule for individual item has begun
                        {
                            if(firstvideo && prevideos.length != 0) //Is this the first video? Then play prerolls
                            {
                                prevideo = prevideos.pop();
                                adcount = numPre - prevideos.length;
                                adtotal = numPre;
                                _controller.setCurrentAd({id: prevideo.id, type:"video", position: "pre", tag: prevideo.tag}); 
                                _makeRequest(prevideo.tag,"video");
                            
                            } else {
                                    
                                if(!firstvideo && intervideos.length != 0 && !interplayed) //Is this the start of a video that is not the first? Then play interrolls
                                {
                                    adtotal = 1;
                                    adcount = 1;
                                    intervideo = intervideos.pop();
                                    _controller.setCurrentAd({id: intervideo.id, type:"video", position: "inter", tag: intervideo.tag}); 
                                    _makeRequest(intervideo.tag,"video");
                                    interplayed = true;
                                }
                            
                                //Schedule the time-marked ads to play at the right time (Video and Overlay)
                                
                                if(typeof overtimeMarker != "undefined" && !_controller.adPlaying()) 
                                {
                                    if(overtimeMarker <= _playerConnect.getPosition() && !adrequestedOver )
                                    {
                                        _controller.setCurrentAd({id: timeoverlay.id, type:"overlay", position: overtimeMarker + " seconds", tag: timeoverlay.tag});
                                        _makeRequest(timeoverlay.tag, "overlay");
                                        if(overtimeMarkers.length > 0)
                                            {
                                                overtimeMarker = overtimeMarkers.pop();
                                                timeoverlay = timeoverlays.pop();
                                            }
                                        else
                                        {
                                            overtimeMarker = NaN;
                                        }
                                        
                                    }
                                }   
                                    
                                if(typeof vidtimeMarker != "undefined" && !_controller.adPlaying())
                                {
                                    if(vidtimeMarker <= _playerConnect.getPosition())
                                    {
                                        adcount = 1;
                                        adtotal = 1;
                                        _controller.setCurrentAd({id: timevideo.id, type:"video", position: vidtimeMarker + " seconds", tag: timevideo.tag});
                                        _makeRequest(timevideo.tag, "video");
                                        if(vidtimeMarkers.length > 0)
                                            {
                                                vidtimeMarker = vidtimeMarkers.pop();
                                                timevideo = timevideos.pop();
                                                
                                            
                                            }
                                        else
                                        {
                                            vidtimeMarker = NaN;
                                        }
                                    }
                                }

                                //Show pre overlays or inter overlays depending on which video it is (first or not first video)
                                if(typeof actualtimePre != "undefined" && !_controller.adPlaying() && !shownpreoverlay)
                                {
                                    if(actualtimePre <= _playerConnect.getPosition())
                                    {
                                        _controller.setCurrentAd({id: preoverlay.id, type:"overlay", position: "pre", tag: preoverlay.tag});
                                        _makeRequest(preoverlay.tag, "overlay");
                                        shownpreoverlay = true;
                                    }
                                } 
                                else if(typeof interovertime != "undefined" && !showninterover && !_controller.adPlaying())
                                {
                                    if(interovertime <= _playerConnect.getPosition())
                                    {
                                        _controller.setCurrentAd({id: interoverlay.id, type:"overlay", position: "inter", tag: interoverlay.tag});
                                        _makeRequest(interoverlay.tag, "overlay");
                                        showninterover = true;
                                    }
                                }
                            }
                        
                        
                        }
                        
                            
                    }   
    
        
        
        
        
        //The 4 following functions provide player information necessary for playing/skinning ads
        
        /**
          * function getPlayer() - returns the player instance
         **/
            
            
        /**
         *function getVideoTag() - returns the video tag the jwplayer is playing in
         **/
        
        
        /**
         *function getAdInfo() - returns certain metadata about ads, used for processing optional configuration options
         **/
        this.getAdInfo = function(){
        
            return {adcount:adcount, adtotal:adtotal};
        };
        
        //Detaches the jwplayer from the current video tag in order to play the Ads, and then requests them
        function _makeRequest(tag,type)
        {
            if (type == "video") {
                
                _playerConnect.detachPlayer();
                if(!optParams.allowplayercontrols)
                    _playerConnect.hideControlbar();
            }
            eventDispatcher.sendEvent(jwplayer.googima.AdScheduler.ADREQUESTED, {tag:tag, type:type});
        }   
        
        _init();
    }
    
})(jwplayer);
/** jwplayer.googima.PlayerConnector interfaces with JW Player to set Event Listeners for ads and Processing the Ad Schedule **/

(function(jwplayer){

    
    jwplayer.googima.PlayerConnector = function(player){
    
        
        var _player = player;
        var detached = false;
        
        
        /** 
          *function getVideoTag(): returns the video tag that _player is based in
         **/
        this.getVideoTag = function(){
            
            if(detached)
                return _player.detachMedia();
            else 
                return document.getElementById(_player.getContainer().id + "_video");
        };
        
        
        /** 
          *function setPlayerEventHandlers(): Sets event handlers for the JW Player through the player's API. 
         **/
        this.setPlayerEventHandlers = function(onPlaylistItemHandler, onPlayHandler, onTimeHandler, postRollChecker){
            
            _player.onPlaylistItem(onPlaylistItemHandler);
            
            _player.onPlay(onPlayHandler);
            
            _player.onTime(onTimeHandler);
            
            if(_player.getPlaylist().length ==1)
                _player.onComplete(postRollChecker);
        
        };
        
        //detach the player from the video tag it is based in. This means the JW Player will stop listening for video tag events (e.g. when an ad is playing)
        this.detachPlayer = function(){
            
            _player.detachMedia();
            detached = true;
        };
        
        //attach the player to the video tag it was based in. The player will start listening for video tag events again.
        this.attachPlayer = function(){
            
            _player.attachMedia();
            detached = false;
        };
        
        // The following functions interface with the JW Player
        /** Beginning of JW Player Interaction Functions **/
        this.isDetached = function(){
        
            return detached;
        }
        
        this.hideControlbar = function(){
        
            _player.getPlugin('controlbar').hide();
        };
        
        this.showControlbar = function(){
        
            _player.getPlugin('controlbar').show();
        };
        
        this.getPlaylist = function(){
        
            return _player.getPlaylist();
            
        }
        
        this.getPlaylistItem = function(){
        
            return _player.getPlaylistItem();
            
        }
        
        this.mute = function(){
        
            _player.setMute(true);
        }
            
        this.getPosition = function(){
        
            return _player.getPosition();
        }
        /** End of JW Player Interaction Functions**/
    }
    
})(jwplayer);(function (jwplayer){
    
    jwplayer.googima.AdControls = function(div, optionalParams, player, controller, playerConnect, adScheduler){
        
        jwplayer.googima.AdControls.ADCLICKED = "adClicked";
        jwplayer.googima.AdControls.ADDISMISSED = "adDismissed";
        var adController = this;
        var _div = div;
        
        var optParams = optionalParams;
        var _player = player;
        var _controller = controller;
        var _playerConnect = playerConnect;
        var _adScheduler = adScheduler;
        var playbutton = document.createElement("img");
        var mutebutton = document.createElement("img");
        var messageBox = document.createElement("div");
        
        var adnumber= document.createElement("div");
        var skipbutton = document.createElement("img");
        var clickdiv= document.createElement("div");
        var overlay = document.createElement("div");
        var overlayclose = document.createElement("img");
        var overlayAd = document.createElement("div");
        
        var playsrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAVCAIAAADNQonCAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAASdAAAEnQB3mYfeAAAAJ9JREFUOE+t1G0RgCAMAFAaEIEoRCEKUYhCFCIQQXe3O9QJG5vyz3M89oE698s6rOs6HQRDKo9d4yGlFGPc5OZEzhle1FpDCCLEEdgZ4Lz3DCQTENF7h9JWyhaB6UBd0wYpCIRKKaQuNYF1QYNGXRaCDEtNtNZIRxQEyV9dyLuLCmI1yy2Cv1EyId5rgRA/rXvAfCKfCMN/C/qtOpILPgG3iNE9V6J34wAAAABJRU5ErkJggg==";
        var overclosesrc = "data:image/gif;base64,R0lGODlhEQAUAPcAAAAAAIAAAACAAICAAAAAgIAAgACAgICAgMDAwP8AAAD/AP//AAAA//8A/wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///yH5BAEAABAALAAAAAARABQAAAhEAFEIHEiwoMGDCBMqXFiQGjWDDiE6fDhwIsWKFgVavIhx40SEHiMm9LiQ5MiQIEOKJLhRY0aWHztydCmRoc2bOHMKDAgAOw==";
        var soundstate1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAASdAAAEnQB3mYfeAAAAJVJREFUOE/tk1ENwCAMREEJEpCABCQgAQlIQQoSkIIEdkkXtizA6PjdfTT8vHLptbLWKj5JSim+wSe1DmutrbXkkgeHEACg8mB8mHMGOYONMWjc5JzDJ957wl5gMtaUUgKM+sODqLYG1o0qxrg07dF1IOpSykvOk9NSSlHg7PVsTWEB4u121xHvqh4tLvg+z8U3bf6WDjULsaN9YNkfAAAAAElFTkSuQmCC";
        var soundstate2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAUCAIAAADtKeFkAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAASdAAAEnQB3mYfeAAAAOhJREFUOE+lk1ERhCAQQCWBEYhABCMYgQhGMAIRjGIEIxjBCNy72RvOw0XU48NBZx/7dhdN0zQxRp4PljHmTT3jvxS7dV27rqsqOOf6vpewH54XVgihbdvSKeM4EsNT4UmOQkmEtMuySA6d50gyk/8oMgyDfKzwYnUUmabpKu+9hz+KoLBtWz2/dEi6mIlYa+d5PqsfeeFTF1URXJT+y6fE71VLoyHmM+m0y3iEicBcHY3Ck4oj0qKd8PRf7YjCl24eNXN/stHc4KUKykkiMou8/ur/g8hZ/6v8PuBJ/iK/v+EX9zLdf9cL1wScCm37SQgAAAAASUVORK5CYII=";
        var skipbuttonsrc = "data:image/gif;base64,R0lGODlhFgAUAPcAAAAAAIAAAACAAICAAAAAgIAAgACAgICAgMDAwP8AAAD/AP//AAAA//8A/wD//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMwAAZgAAmQAAzAAA/wAzAAAzMwAzZgAzmQAzzAAz/wBmAABmMwBmZgBmmQBmzABm/wCZAACZMwCZZgCZmQCZzACZ/wDMAADMMwDMZgDMmQDMzADM/wD/AAD/MwD/ZgD/mQD/zAD//zMAADMAMzMAZjMAmTMAzDMA/zMzADMzMzMzZjMzmTMzzDMz/zNmADNmMzNmZjNmmTNmzDNm/zOZADOZMzOZZjOZmTOZzDOZ/zPMADPMMzPMZjPMmTPMzDPM/zP/ADP/MzP/ZjP/mTP/zDP//2YAAGYAM2YAZmYAmWYAzGYA/2YzAGYzM2YzZmYzmWYzzGYz/2ZmAGZmM2ZmZmZmmWZmzGZm/2aZAGaZM2aZZmaZmWaZzGaZ/2bMAGbMM2bMZmbMmWbMzGbM/2b/AGb/M2b/Zmb/mWb/zGb//5kAAJkAM5kAZpkAmZkAzJkA/5kzAJkzM5kzZpkzmZkzzJkz/5lmAJlmM5lmZplmmZlmzJlm/5mZAJmZM5mZZpmZmZmZzJmZ/5nMAJnMM5nMZpnMmZnMzJnM/5n/AJn/M5n/Zpn/mZn/zJn//8wAAMwAM8wAZswAmcwAzMwA/8wzAMwzM8wzZswzmcwzzMwz/8xmAMxmM8xmZsxmmcxmzMxm/8yZAMyZM8yZZsyZmcyZzMyZ/8zMAMzMM8zMZszMmczMzMzM/8z/AMz/M8z/Zsz/mcz/zMz///8AAP8AM/8AZv8Amf8AzP8A//8zAP8zM/8zZv8zmf8zzP8z//9mAP9mM/9mZv9mmf9mzP9m//+ZAP+ZM/+ZZv+Zmf+ZzP+Z///MAP/MM//MZv/Mmf/MzP/M////AP//M///Zv//mf//zP///ywAAAAAFgAUAAAIjAABPBhIsKDBggASPkg4JaHDhwwbLlQIwM8Dag0hJkx1ccpEgQA4dtQocuHHiQUzbiToByTFhNQGYlw5sKXLmwBidixp8+ZHmAd7+tRoUOhQiCVnPjyJ1KDSlzh56nzKlOYDmymhTuT5cKpEhwst1tTolalIow51Hk2lUmPIr1Dduv2o86BdmXLzug0IADs=";
        var pausesrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAVCAIAAADNQonCAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAASdAAAEnQB3mYfeAAAAF1JREFUOE9jYKAK+E8uQNgONIEMp6DognPs7e3rkYC8vDzQaCCJLAhUA7EPuxFApch+gqgGksiCQDWjRkADZDQsECljpIQFFbIZSVkee06lyAgyyq39+/eTZCU+xQDTtEcPk8Cw2gAAAABJRU5ErkJggg==";
        
        var eventDispatcher = new jwplayer.googima.EventDispatcher();
        jwplayer.utils.extend(this,eventDispatcher);
        
        
        
        
        function _init(){
            
            playbutton.id = _player.id + "_playbutton";
            playbutton.src = pausesrc,
            _div.appendChild(playbutton);
            
            
            mutebutton.id = _player.id + "_mutebutton";
            mutebutton.src = soundstate1;
            _div.appendChild(mutebutton);
            
            
            messageBox.id = _player.id + "_messageBox";
            
            _div.appendChild(messageBox);
            
            
            
            
            adnumber.id = _player.id + "_adnumber";
            _div.appendChild(adnumber);
            
            
            skipbutton.id = _player.id + "_skipbutton";
            skipbutton.src = skipbuttonsrc;
            _div.appendChild(skipbutton);
            
            
            clickdiv.id = _player.id + "_clickdiv";
            _div.appendChild(clickdiv);
            
            
            overlay.id = _player.id + "_overlay";
            
            
            overlayclose.id = _player.id + "_overlayclose";
            overlayclose.src = overclosesrc;
            
            
            
            overlayAd.id = _player.id + "_overlayAd";
            overlay.appendChild(overlayclose);
            overlay.appendChild(overlayAd);
            _div.appendChild(overlay);
        
            _div.style.background = "none";
            _div.style.width = _player.getWidth()  + 'px';
            _div.style.height = 22  + 'px';
            
            
            playbutton.style.visibility = "hidden";
            playbutton.style.position = "absolute";
            playbutton.style.left = "0px";
            playbutton.style.top = "0px";
            playbutton.onclick = function(){
                
                var _video = _playerConnect.getVideoTag();
                
                if(_video.paused)
                    {
                        playbutton.src = pausesrc;
                        _video.play();
                    }
                else    
                    {
                        playbutton.src = playsrc;
                        _video.pause();
                    }
                        
            };
            
            
            mutebutton.style.visibility = "hidden";
            mutebutton.style.position = "absolute";
            mutebutton.style.left = "25px";
            mutebutton.style.top ="1px";
            
            
            mutebutton.onclick = function(){
            
                var _video = _playerConnect.getVideoTag();
                
                if(_video.muted)
                    {
                        mutebutton.src = soundstate1;
                        _video.muted = false;
                    }
                else    
                    {
                        mutebutton.src = soundstate2;
                        _video.muted = true;
                    }
                
            };
            
            
            messageBox.style.visibility = "hidden";
            messageBox.style.position = "absolute";
            messageBox.style.left = "70px";
            messageBox.style.top = "0px";
            
            adnumber.style.visibility = "hidden";
            adnumber.style.position = "absolute";
            adnumber.style.top = "0px";
            adnumber.style.right = "50px";
            
            skipbutton.style.visibility = "hidden";
            skipbutton.style.position = "absolute";
            skipbutton.style.right = "0px";
            skipbutton.style.top = "1px";
            
            clickdiv.style.visibility = "hidden";
            clickdiv.style.position = "absolute";
            clickdiv.style.left = "0px";
            clickdiv.style.top = "20px";
            clickdiv.style.width = _player.getWidth()  + 'px' ;
            clickdiv.style.height = (_player.getHeight() - 20)  + 'px' ;
            clickdiv.style.background = "none";
            clickdiv.onclick = function(){
                if(_controller.adPlaying())
                {
                    eventDispatcher.sendEvent(jwplayer.googima.AdControls.ADCLICKED);
                }
            }
            
            overlayclose.style.visibility = "hidden";
            
            overlayclose.style.position = "absolute";
            overlayclose.style.right = "0px";
            overlayclose.style.top = "0px";
            overlayclose.onclick = function(){
                  
                  overlayAd.innerHTML = "";
                  overlayclose.style.visibility = "hidden";
                  if(jwplayer.utils.isIOS())
                    _playerConnect.getVideoTag().controls = true;
                  eventDispatcher.sendEvent(jwplayer.googima.AdControls.ADDISMISSED);   
                    
            
            };
        
        };
        
        
        this.videoAdUISetup = function(){
        
            overlayAd.innerHTML = "";
            overlayclose.style.visibility = "hidden";
            var _video = _playerConnect.getVideoTag();
            _video.controls = false;
            _video.style.display = "block";
            _div.style.background = "black";
            
            playbutton.style.visibility = "visible";
            clickdiv.style.visibility = "visible";
            
            if(_video.muted) 
                mutebutton.src = soundstate2;
            mutebutton.style.visibility = "visible";
            adnumber.style.visibility = "visible";
            adnumber.style.background = "black";
            adnumber.style.color = "white";
            var adcount = _adScheduler.getAdInfo().adcount;
            var adtotal = _adScheduler.getAdInfo().adtotal;
            
            
            if(optParams.adcounterdynamic != "")
            {
                if(adcount == 1 && adtotal == 1)
                {
                    adnumber.innerHTML = "";
                
                }
                else
                    adnumber.innerHTML = optParams.adcounterdynamic.split(optParams.adcountercountkey)[0] + 
                            adcount + optParams.adcounterdynamic.split(optParams.adcountercountkey)[1].split(optParams.adcountertotalkey)[0] + adtotal;
            }
            
            if(optParams.click_tracking)
            {
                clickdiv.style.visibility = "visible";
            }
            
            if(optParams.usestaticmessage)
            {
                
                messageBox.innerHTML = optParams.admessagestatic;
                messageBox.style.visibility = "visible";
                messageBox.style.color = "white";     
                messageBox.style.background = "black"; 
            }
            else
            {
                //Dynamic message. e.g. "Your ad will close in XX seconds"
                messageBox.style.visibility = "visible";
                messageBox.style.color = "white";     
                messageBox.style.background = "black"; 
                _video.addEventListener("timeupdate", function(){
                    messageBox.innerHTML = optParams.admessagedynamic.split(optParams.admessagedynamickey)[0] +
                        Math.round(_playerConnect.getVideoTag().duration - _playerConnect.getVideoTag().currentTime) + optParams.admessagedynamic.split(optParams.admessagedynamickey)[1]; 
                    },false);
            }
            
            if(optParams.allowadskip)
            {
                 //assign skip button element to this
                skipbutton.onclick = function(){
                
                    eventDispatcher.sendEvent(jwplayer.googima.AdControls.ADDISMISSED);
                    
                };
                
                //add event listener for the passing of "allowadskippastseconds" number of seconds so that skip option becomes available
                _video.addEventListener("timeupdate",function(){
                        
                        if(_video.currentTime > optParams.allowadskippastseconds && _controller.adPlaying())
                            {
                                skipbutton.style.visibility = "visible";
                                
                            }
                
                },false);
                
                 
            }
            
            //Enable native video controls when ad is playing
            if(optParams.allowplayercontrols)
            {
                _video.controls = true;
            }
            
            if(optParams.invertmutebutton)
            {   
                
                var tempstate = soundstate1;
                soundstate1 = soundstate2;
                soundstate2 = tempstate;
                mutebutton.src = soundstate1;
            }
            
            //Set ad video height & width
            if(optParams.advideoheight > 0 && optParams.advideowidth > 0)
            {
                _video.style.width = optParams.advideoheight + 'px';
                _video.style.width = optParams.advideowidth + 'px';
            
            }
            else
                {
                    _video.style.width = "";
                    _video.style.width = "";
                }
                
            if(typeof optParams.companionDiv != "undefined")
                document.getElementById(optParams.companionDiv).style.visibility = "visible";
                
            
        };
        
        this.adTakeDown = function(){
        
            skipbutton.style.visibility = "hidden";
            messageBox.style.visibility = "hidden";
            playbutton.style.visibility = "hidden";
            clickdiv.style.visibility = "hidden";
            mutebutton.style.visibility = "hidden";
            adnumber.style.visibility = "hidden";
            _div.style.background = "none";
            
                
        };
        
        this.overlayAdUISetup = function(){
        
                
            overlayclose.style.visibility = "visible";
            overlayAd.style.visibility = "visible";
            overlayAd.style.background = "none";
            
            var _video = _playerConnect.getVideoTag();
            if(jwplayer.utils.isIOS())
            {
                _video.controls = false;
            }
            if(typeof optParams.companionDiv != "undefined")
                document.getElementById(optParams.companionDiv).style.visibility = "visible";
                
        };
        this.closebuttonSetup = function(){
        
            
            
        }
        this.overlayClose = function(){
            overlayclose.style.visibility = "hidden";
            overlayAd.style.visibility = "hidden";
        }
        
        
        
        _init();
        
        
    };


})(jwplayer);



(function(jwplayer){

    //Define the API Events for the googima Plugin
    jwplayer.googima.APIEvents = {};
    jwplayer.googima.APIEvents.ADSTART = "onAdStart";
    jwplayer.googima.APIEvents.ADCOMPLETE = "onAdComplete";
    jwplayer.googima.APIEvents.ADPROGRESS = "onAdProgress";
    jwplayer.googima.APIEvents.ADCLICKED = "onAdClicked";
    jwplayer.googima.APIEvents.ADDISMISSED = "onAdDismissed";
    jwplayer.googima.APIEvents.ADSCOMPLETE = "onAdsComplete";
    jwplayer.googima.APIEvents.ADNOTAVAILABLE = "onAdNotAvailable";
    jwplayer.googima.APIEvents.ADERROR = "onAdError";
    
})(jwplayer);   


/** The PluginAPISetup class sets up the Plugin API by appending methods to the plugin template/controller. Also processes the "events" block of the configuration options **/

(function(jwplayer){

    jwplayer.googima.PluginAPI = function(controller,config,player){
        
    
        var _controller = controller;
        var eventDispatcher = new jwplayer.googima.EventDispatcher();   
        jwplayer.utils.extend(this,eventDispatcher);
        var _config = config;
        var _player = player;
        var API = this;
        //Initializes the API. Adds the methods for dealing with Event Handlers
        
        this.onAdStart = function(callback){
           
           return _setListeners(jwplayer.googima.APIEvents.ADSTART, callback);
            
        }
        
        this.onAdComplete = function(callback){
        
           return _setListeners(jwplayer.googima.APIEvents.ADCOMPLETE, callback);
        }
        
        this.onAdProgress = function(callback){
        
           return _setListeners(jwplayer.googima.APIEvents.ADPROGRESS, callback);
        }
        
        this.onAdClicked = function(callback){
        
           return _setListeners(jwplayer.googima.APIEvents.ADCLICKED, callback);
        }
        
        this.onAdDismissed = function(callback){
        
           return _setListeners(jwplayer.googima.APIEvents.ADDISMISSED, callback);
        }
        
        this.onAdsComplete = function(callback){
        
          return _setListeners(jwplayer.googima.APIEvents.ADSCOMPLETE, callback);
        }
        
        this.onAdNotAvailable = function(callback){
        
          return _setListeners(jwplayer.googima.APIEvents.ADNOTAVAILABLE, callback);
        }

        this.onAdError = function(callback){
        
            return _setListeners(jwplayer.googima.APIEvents.ADERROR, callback);
        
        }
        
        function _setListeners(evt, callback)
        {
                
            API.addEventListener(evt,function(){callback.apply(_player, arguments);}, false);
            return API;
        }
        
            
            
            
            //This function is called by Googima Flash through External Interface to send the appropriate API events.
        this.sendFlashEvent = function(evtstring,evt){
        
            if(typeof evt.ad != 'undefined')
            {
              if(typeof evt.ad.name != 'undefined')
                evt.ad.id = evt.ad.name;
                
            }
            
            controller.setCurrentAd(evt.ad);
            
            switch(evtstring)
            {
                case "onAdStart": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADSTART,evt);
                    break;  
                case "onAdComplete": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADCOMPLETE,evt);
                    break;  
                case "onAdProgress": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADPROGRESS,evt);   
                    break;
                case "onAdClicked": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADCLICKED,evt);
                    break;
                case "onAdDismissed": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADDISMISSED,evt);
                    break;
                case "onAdsComplete": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADSCOMPLETE,evt);
                    break;
                case "onAdNotAvailable": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADNOTAVAILABLE,evt);
                    break;
                case "onAdError": 
                    eventDispatcher.sendEvent(jwplayer.googima.APIEvents.ADERROR,evt);
                    break;
            }   
        }
        
        //Process the "events" block in configuration options
        for(evnt in _config.events)
            {
                API[evnt](_config.events[evnt]);
            }
            
            //Return a reference to the API (the controller/template itself)
    
        
        
        //Start Initializing the API
    
        
    
    
    };
})(jwplayer);
/** This is the actual template of the googima plugin, or the "controller" so to speak. This is in line with the plugin template provided for the JW Player**/
(function(jwplayer){


  var template = function(player, config, div) {

  
    
    //Set up the Plugin API. This appends the template with the Plugin API functions and some other public functions. This is also the Controller.
    var controller = this;
    var pluginAPI = new jwplayer.googima.PluginAPI(controller,config,player);
    jwplayer.utils.extend(controller,pluginAPI);
    var currentAd = {};
    var adPlaying;
    
    
    //This function appends a piece of javascript (from a url) to the head of the document. 
    //Calls the callback when the script is loaded.
    function _loadScript(url, callback) {
    
       //Create new Script Element and and set the URL
       var script= document.createElement('script');
       script.type = 'text/javascript';
       script.src = url;

       // then bind the event to the callback function 
       // there are several events for cross browser compatibility
       script.onreadystatechange = function(){
            if (this.readyState == 'complete' || this.readyState == 'loaded') callback();
        }
       script.onload = callback;
       
       // fire the loading
       document.head.appendChild(script);
    };
    
    //When the google IMA script loads, call this
    function _onGoogIMASDKLoaded(){
                     
        //Parse Configuration Options
        var parser = new jwplayer.googima.ParameterParser(config,player,controller);
        var params = parser.parseOptions();
        
        //Create a Bridge between the Plugin and the JW Player to set event listeners/handlers- PlayerConnector
        var playerConnect = new jwplayer.googima.PlayerConnector(player);
        
        //Create an AdScheduler object - To Schedule Ads and later Play them
        var adScheduler = new jwplayer.googima.AdScheduler(player, params, controller, playerConnect);
        
        //Create GoogIMABridge Object - Bridge between Google IMA SDK and this Plugin
        var googBridge = new jwplayer.googima.GoogIMABridge(params.optionalParams(), player, playerConnect, controller);
        
        //Create an AdControls object to set up/take down Ad UI.
        var adUI = new jwplayer.googima.AdControls(div,params.optionalParams(),player,controller,playerConnect, adScheduler);
        
        //Set up Event Listeners to listen for events from the above objects so they can be dispatched by the PluginAPI.
        _eventListenerSetup(adScheduler,googBridge,adUI,playerConnect);
            
    };
    
    //Get the Current Ad that is playing, or if no ad is playing, the most recently played ad.
    controller.getCurrentAd = function(){
        
        return currentAd;
    
    };
    
    //Sets the Current Ad  
    controller.setCurrentAd = function(ad){
    
        currentAd = ad;
    
    };
    
    //Set adPlaying to true
    controller.setAdPlaying = function(value){

        adPlaying = value;
    };
    
    controller.adPlaying = function(){
    
        return adPlaying;
    };
    
    
    function _eventListenerSetup(adScheduler,googBridge,adUI,playerConnect)
    {
        //Request an Ad when the schedule says so
        adScheduler.addEventListener(jwplayer.googima.AdScheduler.ADREQUESTED, function(adRequest){
                                                googBridge.requestAds(adRequest.tag, adRequest.type);
                                        },false);
        
        //Send a "Progress Event" while an Ad is playing.
        adScheduler.addEventListener(jwplayer.googima.AdScheduler.ADPROGRESS, function(){
                                                var _video = playerConnect.getVideoTag();
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADPROGRESS, 
                                                                        {position: _video.currentTime, duration: _video.duration, ad:controller.getCurrentAd()});
                                                },false);   
        
        //Send an event after a section of Ads are complete     
        adScheduler.addEventListener(jwplayer.googima.AdScheduler.ADSCOMPLETE, function(){
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADSCOMPLETE, {ad:controller.getCurrentAd()});
                                                },false);
                    
        //Send an event after an Ad starts, and let the contoller know that an ad has Started                   
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.ADSTART, function(){
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADSTART, {ad:controller.getCurrentAd()});
                                                controller.setAdPlaying(true);                      
                                                },false);
    
        //Send an event after an ad completes, also take down Ad UI and move along
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.ADCOMPLETE, function(){
                                                adScheduler.onAdComplete(controller.getCurrentAd());
                                                adUI.adTakeDown();
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADCOMPLETE, {ad:controller.getCurrentAd()});
                                                controller.setAdPlaying(false);         
                                                
                                                },false);
        
        //Set up Video Ad UI after a video ad loads 
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.VIDEOADLOADED, function(){
                                                adUI.videoAdUISetup();
                                                },false);
        
        //Set up Overlay Ad UI after an overlay ad loads
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.OVERLAYADLOADED, function(){
                                                adUI.overlayAdUISetup();
                                                },false);
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.OVERLAYDISPLAYED, function(){
                                                adUI.closebuttonSetup();
                                                },false);
                            
        //Send an Error Event if ad gives an error during play/loading                      
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.ADERROR, function(){
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADERROR, {ad:controller.getCurrentAd()});
                                                controller.setAdPlaying(false);
                                                
                                                if(controller.getCurrentAd().type == "video")
                                                {
                                                    adUI.adTakeDown();
                                                    adUI.overlayClose();
                                                    googBridge.onAdDismissed();
                                                    adScheduler.onAdComplete(controller.getCurrentAd());
                                                }
                                                },false);
                                                    
        //Send an Ad Not Available event if ad does not load/ no ad is returned by Google
        googBridge.addEventListener(jwplayer.googima.GoogIMABridge.ADLOADERROR, function(){
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADNOTAVAILABLE, {ad:controller.getCurrentAd()});
                                                if(controller.getCurrentAd().type == "video")
                                                {
                                                    adUI.adTakeDown();
                                                    adUI.overlayClose();
                                                    googBridge.onAdDismissed();
                                                    adScheduler.onAdComplete(controller.getCurrentAd());
                                                }
                                                },false);
        
        //Send Ad Clicked event if ad is clicked
        adUI.addEventListener(jwplayer.googima.AdControls.ADCLICKED, function(){
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADCLICKED, {ad:controller.getCurrentAd()});
                                                },false);
            
        //Send Event when ad is skipped. Take down Ad UI and move along     
        adUI.addEventListener(jwplayer.googima.AdControls.ADDISMISSED, function(){
                                                pluginAPI.sendEvent(jwplayer.googima.APIEvents.ADDISMISSED, {ad:controller.getCurrentAd()});
                                                controller.setAdPlaying(false);
                                                adUI.adTakeDown();
                                                adUI.overlayClose();
                                                googBridge.onAdDismissed();
                                                adScheduler.onAdComplete(controller.getCurrentAd());
                                                },false);
                                                
    
    }
    
    player.onReady(function(){
    
        //Once the player is ready, load the google IMA script if player is in HTML5 and proceed
        if (player.getRenderingMode() == 'html5') {
            _loadScript('http://www.google.com/jsapi', function(){
            google.load("ima", "1", {"callback" : _onGoogIMASDKLoaded });
            });
        } else {
                div.style.visibility = "hidden";
            }
    });
 


    
    //This function resizes the Ad Controls (but NOT the overlay Ad slot) when the player is resized
     this.resize = function(width,height){
        
            div.style.width = player.getWidth();
            
            div.style.height = 20  + 'px';
      };
 
  };
  
  
  jwplayer().registerPlugin('googima', template, 'googima.swf');
  
  
})(jwplayer);