"use strict";
define(['./map-search'], function(search) {
    var run = function() {
        test('Map Search: do something.', function() {
            equal(2, 2, 'The return should be 2.');
        });
    };
    return {run: run}
});
