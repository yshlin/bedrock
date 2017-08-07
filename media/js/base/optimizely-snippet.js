/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
    'use strict';

    var OPTIMIZELY_PROJECT_ID = document.getElementsByTagName('html')[0].getAttribute('data-optimizely-project-id');

    // If doNotTrack is not enabled, it is ok to add Optimizely
    // @see https://bugzilla.mozilla.org/show_bug.cgi?id=1217896 for more details
    if (typeof Mozilla.dntEnabled === 'function' && !Mozilla.dntEnabled() && OPTIMIZELY_PROJECT_ID) {
        if (Mozilla.Cookies) {
            // Check to see if referrer was already stored.
            var originalReferrer = Mozilla.Cookies.getItem('mozoptly-original-referrer');

            // Check if redirect happened (value is empty string/falsy, so don't
            // use getItem).

            // NOTE: this cookie value is provided by Optimizely, so could
            // change at any time, but it's the only way to know if a redirect
            // occurred. :(
            var optlyDidRedirect = Mozilla.Cookies.hasItem('optimizelyRedirect');

            // Only set the referrer cookie if it isn't already set *and* a
            // redirect did not take place.
            if (!originalReferrer && !optlyDidRedirect) {
                // If a visitor landed directly on the page, default to 'direct'.
                var ref = document.referrer || 'direct';
                // Cookie must be set to root path in the event optimizely
                // redirects to a different moz.org URL.
                Mozilla.Cookies.setItem('mozoptly-original-referrer', ref, null, '/');
            }
        }

        // now that referrer dance is complete, load optimizely
        (function(d, optID) {
            var newScriptTag = d.createElement('script');
            var target = d.getElementsByTagName('script')[0];
            newScriptTag.src = 'https://cdn.optimizely.com/js/' + optID + '.js';
            target.parentNode.insertBefore(newScriptTag, target);
        }(document, OPTIMIZELY_PROJECT_ID));
    }
})();
