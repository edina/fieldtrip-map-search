/*
Copyright (c) 2014, EDINA.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this
   list of conditions and the following disclaimer in the documentation and/or
   other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software must
   display the following acknowledgement: This product includes software
   developed by the EDINA.
4. Neither the name of the EDINA nor the names of its contributors may be used to
   endorse or promote products derived from this software without specific prior
   written permission.

THIS SOFTWARE IS PROVIDED BY EDINA ''AS IS'' AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL EDINA BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/

"use strict";

/**
 * Map searching module.
 */
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

        utils.hideKeyboard();

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
        });

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
