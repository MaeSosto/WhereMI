
      // This example adds a search box to a map, using the Google Place Autocomplete
      // feature. People can enter geographical searches. The search box will return a
      // pick list containing a mix of places and predicted search terms.

      // This example requires the Places library. Include the libraries=places
      // parameter when you first load the API. For example:
      // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
      
      navigator.geolocation.getCurrentPosition(initAutocomplete);

      function initAutocomplete(position) {
        var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var map = new google.maps.Map(document.getElementById('map'), {
          center: coords,
          zoom: 17,
          mapTypeId: 'roadmap'
          
        });
        
        var marker = new google.maps.Marker({
          position: coords,
          
      });

      marker.setMap(map);

        // Create the search box and link it to the UI element.
        var input = document.getElementById('search');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls.push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });
      }



     
 /*********** LOGIN BUTTON ***********/

        function onSignIn(googleUser) {
   // Useful data for your client-side scripts:
   var profile = googleUser.getBasicProfile();
   console.log("ID: " + profile.getId()); // Don't send this directly to your server!
   console.log('Full Name: ' + profile.getName());
   console.log('Given Name: ' + profile.getGivenName());
   console.log('Family Name: ' + profile.getFamilyName());
   console.log("Image URL: " + profile.getImageUrl());
   console.log("Email: " + profile.getEmail());

   // The ID token you need to pass to your backend:
   var id_token = googleUser.getAuthResponse().id_token;
   console.log("ID Token: " + id_token);
 }

   


 /******** AUDIO  ********/

 var player;

 function onYouTubeIframeAPIReady() {

 $("#playbutton").click(toggleAudio); //se clicchi sul pulsante chiama toogleAudio

 player = new YT.Player('youtube-player', { //lega il player al div "youtube-player"
  height: '0',
  width: '0',
  videoId: "-Jqz3GQWhJY", //url del video (stringa a 11 caratteri, dopo youtube.com/watch?v=)
  playerVars: {
    autoplay: 0,
    loop: 1,
  },
});


function toggleAudio() {
  if ( player.getPlayerState() == 1 || player.getPlayerState() == 3 ) {
    player.pauseVideo(); 
  } else {
    player.playVideo(); 
  } 
} 
 }



 /*
 var player;
  function onYouTubeIframeAPIReady() {

    var tubediv = document.getElementById("youtube-audio");
    tubediv.innerHTML = '<img id="youtube-icon" src=""/><div id="youtube-player"></div>';
    tubediv.style.cssText = 'width:150px;margin:2em auto;cursor:pointer;cursor:hand;display:none';
    tubediv.onclick = toggleAudio;

    player = new YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: tubediv.dataset.video,
      playerVars: {
        autoplay: tubediv.dataset.autoplay,
        loop: tubediv.dataset.loop,
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange 
      } 
    });
  } 

  function togglePlayButton(play) {    
    document.getElementById("youtube-icon").src = play ? "https://i.imgur.com/IDzX9gL.png" : "https://i.imgur.com/quyUPXN.png";
  }

  function toggleAudio() {
    if ( player.getPlayerState() == 1 || player.getPlayerState() == 3 ) {
      player.pauseVideo(); 
      togglePlayButton(false);
    } else {
      player.playVideo(); 
      togglePlayButton(true);
    } 
  } 

  function onPlayerReady(event) {
    player.setPlaybackQuality("small");
    document.getElementById("youtube-audio").style.display = "block";
    togglePlayButton(player.getPlayerState() !== 5);
  }

  function onPlayerStateChange(event) {
    if (event.data === 0) {
      togglePlayButton(false); 
    }
  }


*/
