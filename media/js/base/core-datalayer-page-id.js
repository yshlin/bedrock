/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

if (typeof Mozilla == 'undefined') {
    var Mozilla = {};
}

(function(Mozilla) {
    // init dataLayer object
    var dataLayer = window.dataLayer = window.dataLayer || [];
    var Analytics = {};

    /** Returns page ID used in Event Category for GA events tracked on page.
    * @param {String} path - URL path name fallback if page ID does not exist.
    * @return {String} GTM page ID.
    */
    Analytics.getPageId = function(path) {
        var pageId = document.getElementsByTagName('html')[0].getAttribute('data-gtm-page-id');
        var pathName = path ? path : document.location.pathname;

        return pageId ? pageId : pathName.replace(/^(\/\w{2}\-\w{2}\/|\/\w{2,3}\/)/, '/');
    };

    Analytics.getTrafficCopReferrer = function() {
        var referrer;

        // if referrer cookie exists, store the value and remove the cookie
        if (Mozilla.Cookies.hasItem('mozilla-traffic-cop-original-referrer')) {
            referrer = Mozilla.Cookies.getItem('mozilla-traffic-cop-original-referrer');

            // referrer shouldn't persist
            Mozilla.Cookies.removeItem('mozilla-traffic-cop-original-referrer');
        }

        return referrer;
    };

    Analytics.getOptimizelyReferrer = function() {
        var referrer;

        // This is set by Optimizely's JS *only after a redirect*. Necessary
        // because 'mozoptly-original-referrer' is optimistically set every time
        // Optimizely loads. We need to make sure a redirect was performed (as
        // opposed to an in-place content change).

        // This cookie (afaict) has no value, so we just need to check if it
        // exists, and not check for its value (which would be an empty string/
        // falsy value).

        // NOTE: As it's set by Optimizely's JS, the name of this cookie can
        // change at any time, but it's the only way we can be sure a redirect
        // happened.
        var optlyDidRedirect = Mozilla.Cookies.hasItem('optimizelyRedirect');

        // if a redirect was performed, and an original referrer was stored
        if (optlyDidRedirect && Mozilla.Cookies.hasItem('mozoptly-original-referrer')) {
            // Grab the referrer from the cookie, then remove the cookie.
            referrer = Mozilla.Cookies.getItem('mozoptly-original-referrer');

            Mozilla.Cookies.removeItem('mozoptly-original-referrer', '/');
        }

        return referrer;
    };

    Analytics.getExperimentToolReferrer = function() {
        var referrer;

        // Make sure cookie lib is available.
        if (Mozilla.Cookies) {
            // First, check referrer from Traffic Cop.
            referrer = Analytics.getTrafficCopReferrer();

            // If no Traffic Cop referrer exists, check for Optimizely referrer.
            if (!referrer) {
                referrer = Analytics.getOptimizelyReferrer();
            }
        }

        return referrer;
    };

    Analytics.buildDataObject = function() {
        var dataObj = {
            'event': 'page-id-loaded',
            'pageId': Analytics.getPageId()
        };

        var referrer = Analytics.getExperimentToolReferrer();

        // if original referrer exists, pass it to GTM
        if (referrer) {
            console.log('Sending this referer to GTM: ' + referrer);
            // Traffic Cop & optimizely-snippet.js set the referrer to 'direct'
            // if document.referer is empty prior to redirect, so this value
            // will either be a URL or the string 'direct'.
            dataObj.customReferrer = referrer;
        }

        return dataObj;
    };

    // Push page ID into dataLayer so it's ready when GTM container loads.
    dataLayer.push(Analytics.buildDataObject());

    Mozilla.Analytics = Analytics;
})(window.Mozilla);
