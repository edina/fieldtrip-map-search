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

/* global asyncTest, equal, notEqual, ok, start */

define(['map', './map-search', 'tests/systests'], function(map, search, sys) {

return {

unit: {
    run: function() {
        module("Map Search");
    }
},

sys: {
    run: function() {
        module("Map Search");

        asyncTest("Map Search", function(){
            var orgLonLat = map.getCentre(true);

            sys.goToMap(function(){
                sys.clickAndTest({
                    'id': '#map-page .map-search',
                    'test':function(){
                        return $('#map-search-popup').parent().hasClass("ui-popup-active");
                    },
                    'cb': function(success){
                        ok(success, "Popup visible");
                        var searchId = '#map-search-term';
                        $(searchId).val('Glenro');
                        var e = $.Event('keyup');
                        e.keyCode = 8;
                        $(searchId).trigger(e);
                        sys.intervalTest({
                            'id': searchId,
                            'test': function(){
                                if($('#map-search-results li').length > 0){
                                    return true;
                                }
                            },
                            'cb': function(success){
                                ok(success, "Results found");
                                $($('#map-search-results li').get(1)).click();
                                sys.changePageCheck('#map-page', function(){
                                    var lonLat = map.getCentre(true).centre;
                                    notEqual(orgLonLat.lon, lonLat.lon, 'Compare longitude with old');
                                    notEqual(orgLonLat.lat, lonLat.lat, 'Compare latitude with old');
                                    equal(lonLat.lon.toFixed(2), -3.17, 'Glenrothes centre longitude');
                                    equal(lonLat.lat.toFixed(2), 56.2, 'Glenrothes centre latitude');
                                    start();
                                });
                            }
                        });
                    }
                });
            });
        });
    }
}

};

});
