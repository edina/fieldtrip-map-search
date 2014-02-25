define(['map', 'utils'], function(map, utils){
    var timer;
    var searchQuery;
    var unlockUrl = '/unlock/ws/search';

    if(utils.isMobileDevice()){
        unlockUrl = 'http://unlock.edina.ac.uk/ws/search';
    }

    var autocomplete = function(){
        if(timer){
            clearTimeout(this.timer);
        }

        timer = setTimeout(perform, 500);
    };

    /**
     * kick off map search
     */
    var search = function(){
        console.log("jings");
        var inFocus = 0;

        // TODO
        // $('#search-page').on('pagebeforehide', function (event, ui){
        //     plugins.SoftKeyBoard.hide();
        // });

        if($('#map-search-popup').length === 0){
            $('body').append('<div id="map-search-popup" data-role="popup"><a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right"></a><h3>Search Map</h3><div id="xyz" data-role=content"><input type="text" name="searchterm" id="searchterm" value=""></input></div></div>').trigger('create');
            //$('#xyz').append('<ul id="search-results" data-role="listview"></ul>').listview().listview('refresh');
            $('#xyz').append('<ul id="search-results" data-role="listview"></ul>');
            //console.log($('#xyz').append('<ul id="search-results" data-role="listview"></ul>').listview());
        }

        //$('#map-search-popup').trigger('create');
        $('#search-results').listview().listview('refresh');
        $('#map-search-popup').popup('open');

        $('#search-spinner').hide();
        $('#searchterm').keyup(function(event){
            if((event.keyCode === 38) || (event.keyCode === 40)){
                // up or down arrow has been clicked focus on entry
                $($('#search-results li')).blur();
                if(event.keyCode === 38){
                    if(inFocus >= 0){
                        --inFocus;
                    }
                }
                else{
                    if(inFocus < $('#search-results li').length){
                        ++inFocus;
                    }
                }

                $($('#search-results li')[inFocus]).focus();
            }
            else if(event.keyCode === 13){
                // enter pressed
                var entry = $('#search-results li')[inFocus];
                if(entry){
                    centreOnPlace($(entry));
                }
            }
            else{
                // ignore non character keys (except delete) and anything less than 3 characters
                if((String.fromCharCode(event.keyCode).match(/\w/) || event.keyCode === 8) &&
                   $('#searchterm').val().length > 2){
                    inFocus = -1;
                    autocomplete();
                }
            }
        });

        //$('#map-search-popup').popup('open');
        //$('#map-search-popup').popup().trigger("create").popup('open');
        $('#map-search-popup').css({position:'fixed', top:'10%'});
        //console.log($('#search-results'));
        //$('#search-results').listview().listview('refresh');
    };

    /**
     * Perform search based on user input
     */
    var perform = function(){
        $('#search-spinner').show();

        if(searchQuery){
            searchQuery.abort();
        }

        searchQuery = $.getJSON(
            unlockUrl,
            {
                name: $('#searchterm').val() + '*',
                gazetteer: 'os',
                maxRows: '10',
                format: 'json'
            },
            function(data){
                searchQuery = undefined; // prevent aborting
                $('#search-results').html('');
                var uniqueList = {};
                $.each(data.features, function(i, feature){
                    var name = feature.properties.name;
                    if(feature.properties.adminlevel2){
                        name += ', ' + $.trim(feature.properties.adminlevel2);
                    }

                    if(!uniqueList[name]){
                        uniqueList[name] = true;
                        var html = '<li class="search-result-entry"><a href="#">' + name +
                            '</a><input type="hidden" value="' + feature.properties.centroid + '" /></li>';
                        $('#search-results').append(html);
                    }
                });

                if($('#search-results li').length > 0){
                    $('#search-results').append('<br>');
                    $('#search-results').listview("refresh");

                    $('.search-result-entry').click(function(event) {
                        // entry selected, centre map
                        centreOnPlace($(event.currentTarget));
                    });
                }

                $('#search-spinner').hide();
            }
        ).error(function(error) {
            console.warn("Problem fetching unlock json");
            $('#search-spinner').hide();
        });
    };

    // $(document).on('pageshow', '#myplugin-page', function(){
    //     // do something
    // });

    $(document).on(
        'vmousedown',
        '.map-search',
        search
    );

    $('head').prepend('<link rel="stylesheet" href="plugins/map-search/css/style.css" type="text/css" />');/**
 * Use unlock for map searches.
 * @param options
 *     isMobileApp - is this being run within a native app?
 */
// var MapSearch = function(options) {
//     this.map = options.map;

//     if(options.isMobileApp){
//         this.unlockUrl = 'http://unlock.edina.ac.uk/ws/search';
//     }
//     else{
//         this.unlockUrl = '/unlock/ws/search';
//     }
// };

/**
 * Kick off auto complete.
 */
// MapSearch.prototype.autocomplete = function(){
//     if(this.timer){
//         clearTimeout(this.timer);
//     }

//     this.timer = setTimeout($.proxy(this.perform, this), 500);
// };

/**
 * Perform search based on user input
 */
// MapSearch.prototype.perform = function(){
//     $('#search-spinner').show();

//     if(this.searchQuery){
//         this.searchQuery.abort();
//     }

//     this.searchQuery = $.getJSON(
//         this.unlockUrl,
//         {
//             name: $('#searchterm').val() + '*',
//             gazetteer: 'os',
//             maxRows: '10',
//             format: 'json'
//         },
//         $.proxy(function(data){
//             this.searchQuery = undefined; // prevent aborting
//             $('#search-results').html('');
//             var uniqueList = {};
//             $.each(data.features, function(i, feature){
//                 var name = feature.properties.name;
//                 if(feature.properties.adminlevel2){
//                     name += ', ' + $.trim(feature.properties.adminlevel2);
//                 }

//                 if(!uniqueList[name]){
//                     uniqueList[name] = true;
//                     var html = '<li class="search-result-entry"><a href="#">' + name +
//                         '</a><input type="hidden" value="' + feature.properties.centroid + '" /></li>';
//                     $('#search-results').append(html);
//                 }
//             });

//             if($('#search-results li').length > 0){
//                 $('#search-results').append('<br>');
//                 $('#search-results').listview("refresh");

//                 $('.search-result-entry').click($.proxy(function(event) {
//                     // entry selected, centre map
//                     this.centreOnPlace($(event.currentTarget));
//                 }, this));
//             }

//             $('#search-spinner').hide();

//         }, this)
//     ).error(function(error) {
//         console.warn("Problem fetching unlock json");
//         $('#search-spinner').hide();
//     });
// };

/**
 * Complete search by centering on map and closing dialog.
 * @paran obj Target element.
 */
// MapSearch.prototype.centreOnPlace = function(obj){
//     var centre = $(obj).find('input').val();

//     // undefined will keep at same zoom level
//     this.map.setCentreStr(centre, undefined, true);

//     // don't centre map on annotation
//     this.map.storage.set('ignore-centre-on-annotation', true);
//     // close dialog
//     $('#search-page-close').click();
// };

});
