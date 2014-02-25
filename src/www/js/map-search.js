define(['map', 'utils'], function(map, utils){
    var timer;
    var searchQuery;
    var unlockUrl = '/unlock/ws/search';

    if(utils.isMobileDevice()){
        unlockUrl = 'http://unlock.edina.ac.uk/ws/search';
    }

    /**
     * Click off map search auto complete.
     */
    var autocomplete = function(){
        if(timer){
            clearTimeout(timer);
        }

        timer = setTimeout(perform, 500);
    };

    /**
     * Complete search by centering on map and closing dialog.
     * @paran obj Target element.
     */
    var centreOnPlace = function(obj){
        var centre = $(obj).find('input').val();

        // undefined will keep at same zoom level
        map.setCentreStr(centre, undefined, true);

        // don't centre map on annotation
        localStorage.setItem('ignore-centre-on-annotation', true);

        // close dialog
        $('#search-page-close').click();
    };

    /**
     * kick off map search
     */
    var search = function(){
        var inFocus = 0;

        // TODO
        // $('#search-page').on('pagebeforehide', function (event, ui){
        //     plugins.SoftKeyBoard.hide();
        // });

        $('#map-search-spinner').hide();
        $('#map-search-term').keyup(function(event){
            if((event.keyCode === 38) || (event.keyCode === 40)){
                // up or down arrow has been clicked focus on entry
                $($('#map-search-results li')).blur();
                if(event.keyCode === 38){
                    if(inFocus >= 0){
                        --inFocus;
                    }
                }
                else{
                    if(inFocus < $('#map-search-results li').length){
                        ++inFocus;
                    }
                }

                $($('#map-search-results li')[inFocus]).focus();
            }
            else if(event.keyCode === 13){
                // enter pressed
                var entry = $('#map-search-results li')[inFocus];
                if(entry){
                    centreOnPlace($(entry));
                }
            }
            else{
                // ignore non character keys (except delete) and anything less than 3 characters
                if((String.fromCharCode(event.keyCode).match(/\w/) || event.keyCode === 8) &&
                   $('#map-search-term').val().length > 2){
                    inFocus = -1;
                    autocomplete();
                }
            }
        })

        if($('#map-search-results li').length > 0){
            $('#map-search-term').val('');
            $('#map-search-results').html('');
        }

        $('#map-search-popup').popup('open');
        $('#map-search-term').focus();

        var headHeight = $('.ui-page-active .ui-header').first().height();
        var windowHeight = $(window).height() - (headHeight + $('.ui-page-active .ui-footer').first().height());
        var top = headHeight + 20;
        var maxHeight = windowHeight - 20;
        $('#map-search-popup').css({'position':'fixed', 'top': top});
        $('#map-search-results').css({'max-height': maxHeight});
    };

    /**
     * Perform search based on user input
     */
    var perform = function(){
        $('#map-search-spinner').show();

        if(searchQuery){
            searchQuery.abort();
        }

        searchQuery = $.getJSON(
            unlockUrl,
            {
                name: $('#map-search-term').val() + '*',
                gazetteer: 'os',
                maxRows: '10',
                format: 'json'
            },
            function(data){
                searchQuery = undefined; // prevent aborting
                $('#map-search-results').html('');
                var uniqueList = {};
                $.each(data.features, function(i, feature){
                    var name = feature.properties.name;
                    if(feature.properties.adminlevel2){
                        name += ', ' + $.trim(feature.properties.adminlevel2);
                    }

                    if(!uniqueList[name]){
                        uniqueList[name] = true;
                        var html = '<li class="map-search-result-entry"><a href="#">' + name + '</a><input type="hidden" value="' + feature.properties.centroid + '" /></li>';
                        $('#map-search-results').append(html);
                    }
                });

                if($('#map-search-results li').length > 0){
                    $('#map-search-results').append('<br>');
                    $('#map-search-results').listview("refresh");
                }

                $('#map-search-spinner').hide();
            }
        ).error(function(error) {
            console.warn("Problem fetching unlock json");
            $('#map-search-spinner').hide();
        });
    };

    // TODO - doesn't work on android after second invoke
    $(document).on(
        'click',
        '.map-search-result-entry',
        function(event){
            centreOnPlace($(event.currentTarget));
            $('#map-search-popup').popup('close');
        }
    );

    $(document).on(
        'vmousedown',
        '.map-search',
        search
    );

    $('head').prepend('<link rel="stylesheet" href="plugins/map-search/css/style.css" type="text/css" />');
});
