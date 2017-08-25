/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (Mozilla) {
    'use strict';

    var client = Mozilla.Client;
    var _supportsWebAnimations = 'animate' in document.createElement('div');
    var _supportsPromises = 'Promise' in window;
    var cutsTheMustard = _supportsWebAnimations && _supportsPromises;
    var $slideShow = $('.carousel');
    var button = document.querySelectorAll('.path-selector ul > li > button');
    var step1 = document.querySelector('.step-1');
    var step2 = document.querySelector('.step-2');

    function initSlideShow() {
        $slideShow.cycle({
            fx: 'scrollHorz',
            log: false,
            slides: '> .carousel-item',
            pager: '> .carousel-pager',
            pauseOnHover: true,
            speed: 620,
            timeout: 6000,
            delay: 5000
        });
    }

    function initAccountsForm() {
        if (client.isFirefoxDesktop) {
            // initialize FxA iframe form
            client.getFirefoxDetails(function(data) {
                Mozilla.FxaIframe.init({
                    distribution: data.distribution,
                    gaEventName: 'firstrun-fxa'
                });
            });
        }
    }

    // replaces utm_campaign param in FxA iframe data-src with data-id value from button click.
    function updateUTMParam(id) {
        var utmCampaign = id ? encodeURIComponent(id) : 'fxa-embedded-form';
        var iframe = document.getElementById('fxa');
        var dataSrc = iframe.getAttribute('data-src');
        iframe.setAttribute('data-src', dataSrc.replace('utm_campaign=fxa-embedded-form', 'utm_campaign=' + utmCampaign));
    }

    // animates page to step2 and loads the FxA sign up form.
    function goToStep2() {

        // fancy transision requires Web Animations and Promise support.
        if (cutsTheMustard) {
            fadeOutStep1().then(function() {
                // destroy slider on step-1 as no longer needed.
                $slideShow.cycle('destroy');
                fadeInStep2().then(initAccountsForm);
            });
        }
        // fallback to simple non-animated transition.
        else {
            step1.classList.add('hidden');
            $slideShow.cycle('destroy');

            step2.classList.remove('hidden');
            initAccountsForm();
        }
    }

    function onButtonClick(e) {
        e.preventDefault();
        updateUTMParam(e.target.dataset.id);
        unbindEvents();
        goToStep2();
    }

    function onButtonMouseOver(e) {
        $slideShow.cycle('pause'); //pause auto-running slideshow
        $slideShow.cycle('goto', e.target.dataset.index); //go to specific path
    }

    function onButtonMouseOut() {
        $slideShow.cycle('resume'); //resume auto-running slideshow
    }

    function bindEvents() {
        for (var i = 0; i < button.length; i++) {
            button[i].addEventListener('mouseover', onButtonMouseOver, false);
            button[i].addEventListener('mouseout', onButtonMouseOut, false);
            button[i].addEventListener('click', onButtonClick, false);
        }
    }

    function unbindEvents() {
        for (var i = 0; i < button.length; i++) {
            button[i].removeEventListener('mouseover', onButtonMouseOver, false);
            button[i].removeEventListener('mouseout', onButtonMouseOut, false);
            button[i].removeEventListener('click', onButtonClick, false);
        }
    }

    function animateElement(selector, keyframes, options) {
        return new Promise(function(resolve, reject) {
            var element = document.querySelector(selector);

            if (element) {
                var animation = element.animate(keyframes, options);
                animation.onfinish = function() {
                    resolve(true);
                };
            } else {
                reject('element not found');
            }
        });
    }

    function fadeOutStep1() {
        return new Promise(function(resolve, reject) {
            var keyframes = [
                { opacity: 1 },
                { opacity: 0 }
            ];

            var options = {
                duration: 200,
                fill: 'forwards',
                easing: 'ease-out',
            };

            animateElement('.step-1', keyframes, options).then(function() {
                step1.classList.add('hidden');
                resolve(true);
            }).catch(function(reason) {
                reject(reason);
            });
        });
    }

    function fadeInStep2() {
        return new Promise(function(resolve, reject) {
            var keyframes = [
                { opacity: 0 },
                { opacity: 1 }
            ];

            var options = {
                duration: 200,
                fill: 'forwards',
                easing: 'ease-in',
            };

            step2.classList.remove('hidden');

            animateElement('.step-2', keyframes, options).then(function() {
                resolve(true);
            }).catch(function(reason) {
                reject(reason);
            });
        });
    }

    initSlideShow();
    bindEvents();

})(window.Mozilla);
