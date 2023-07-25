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