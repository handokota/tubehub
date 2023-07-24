/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 erkserkserks
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// This content script runs in an isolated environment and cannot modify any
// javascript variables on the youtube page. Thus, we have to inject another
// script into the DOM.

var injectScript = document.createElement('script');
// Use textContent instead of src to run inject() synchronously
injectScript.textContent = "(function(){" + inject.toString() + "inject();})();";
injectScript.onload = function() {
  // Remove <script> node after injectScript runs.
  this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(injectScript);

// VIDEO QUALITY

(function() {
  document.addEventListener('yt-navigate-finish', function(event) {
    if(location.pathname === '/watch') {
      selectPreferredQuality();
    }
  });

  var selectPreferredQuality = function() { 
    var qualitiesArray = [
      '4320p', 
      '4320p60', 
      '4320p50', 
      '4320p48', 
      '2160p', 
      '2160p60', 
      '2160p50', 
      '2160p48', 
      '1440p',
      '1440p60',
      '1440p50',
      '1440p48',
      '1080p',
      '1080p60',
      '1080p50',
      '1080p48',
      '720p',
      '720p60',
      '720p50',
      '720p48',
      '480p',
      '360p',
      '240p',
      '144p',
      'Auto'
    ];

    chrome.storage.sync.get(['preferredQuality'], function(result) { 
      updateQuality(result.preferredQuality); 
    });

    var updateQuality = function(preferredQuality) {
      preferredQuality = '1080p'
      if (preferredQuality === undefined) {
        preferredQuality = 'best-available';
        chrome.storage.sync.set({preferredQuality: preferredQuality}, function() {});
      }

      var settingsButton = document.getElementsByClassName('ytp-settings-button')[0];

      settingsButton.click();

      var buttons = document.getElementsByClassName('ytp-menuitem-label');

      for (var i = 0; i < buttons.length; i++) {
        if(buttons[i].innerHTML === 'Quality') {
          buttons[i].click();
        }
      }

      var targetItem;

      if(preferredQuality === 'best-available') {
        targetItem = document.querySelector('.ytp-quality-menu .ytp-menuitem-label');
      } else {
        var targetItems = document.querySelectorAll('.ytp-quality-menu .ytp-menuitem-label');

        var loopCounter = 0;

        function findTargetItem() {
          for (var i = 0; i < targetItems.length; i++) {
            var potentialTargetItem = targetItems[i].childNodes[0].childNodes[0];

            var quality = potentialTargetItem.innerHTML.split(' ')[0];

            if(quality === preferredQuality) {
              targetItem = potentialTargetItem;
            }
          }

          if(targetItem === undefined && loopCounter < 10) {
            var key = qualitiesArray.indexOf(preferredQuality);
            preferredQuality = qualitiesArray[key + 1];

            loopCounter++;

            return findTargetItem();
          }

          return targetItem;
        }

        targetItem = findTargetItem();
      }

      targetItem.click();
    }
  };
})();