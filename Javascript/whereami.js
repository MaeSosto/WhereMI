
    
     
    //  if(navigator.geolocation){ //controllo se è presente la geolocalizzazione
    //       navigator.geolocation.getCurrentPosition(initAutocomplete);
    //   }else{
    //       console.log('position not available'); //messaggio di errore se non è presente
    //   }


 /**************SETTAGGIO MAPPA*************/

    // funzione pr l'inizializazione delle coordinate

      function initCoords() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(initAutocomplete);
        } else {
          showError("Your browser does not support Geolocation!");
        }
      }

      function initAutocomplete(position) {
        var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var map = new google.maps.Map(document.getElementById('map'), {
          center: coords,
          zoom: 17,
          mapTypeId: 'roadmap',
          disableDefaultUI: true
          
        });
        
        var marker = new google.maps.Marker({
          position: coords,
          
      });

          marker.setMap(map);
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


    /*********************NAVIGAZIONE**************************/

          function calculateRoute(from, to) {

              var myOptions = {
                  zoom: 10,
                  center: coords,
                  mapTypeId: google.maps.MapTypeId.ROADMAP
              };
              // Draw the map
              var mapObject = new google.maps.Map(document.getElementById("map"), myOptions);

              var directionsService = new google.maps.DirectionsService();
              var directionsRequest = {
                  origin: from,
                  destination: to,
                  travelMode: google.maps.DirectionsTravelMode.DRIVING,
                  unitSystem: google.maps.UnitSystem.METRIC
              };
              directionsService.route(
                  directionsRequest,
                  function(response, status)
                  {
                      if (status == google.maps.DirectionsStatus.OK)
                      {
                          new google.maps.DirectionsRenderer({
                              map: mapObject,
                              directions: response
                          });
                      }
                      else
                          $("#error").append("Unable to retrieve your route<br />");
                  }
              );
          }

          $(document).ready(function () {
              // If the browser supports the Geolocation API
              if (typeof navigator.geolocation == "undefined") {
                  $("#error").text("Your browser doesn't support the Geolocation API");
                  return;
              }

              $("#from-link, #to-link").click(function (event) {
                  event.preventDefault();
                  var addressId = this.id.substring(0, this.id.indexOf("-"));

                  navigator.geolocation.getCurrentPosition(function (position) {
                          var geocoder = new google.maps.Geocoder();
                          geocoder.geocode({
                                  "location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
                              },
                              function (results, status) {
                                  if (status == google.maps.GeocoderStatus.OK)
                                      $("#" + addressId).val(results[0].formatted_address);
                                  else
                                      $("#error").append("Unable to retrieve your address<br />");
                              });
                      },
                      function (positionError) {
                          $("#error").append("Error: " + positionError.message + "<br />");
                      },
                      {
                          enableHighAccuracy: true,
                          timeout: 10 * 1000 // 10 seconds
                      });
              });
              /**************** invio della funzione per creare la strada**************/

              $("#calculate-route").submit(function (event) {
                  event.preventDefault();
                  calculateRoute($("#from").val(), $("#to").val());
              });

              /**************tasto per resettare la mappa*****************/

              $("#reset-map").click(function () {
                   map = new google.maps.Map(document.getElementById('map'), {
                      center: coords,
                      zoom: 17,
                      mapTypeId: 'roadmap'

                  });
                   marker = new google.maps.Marker({
                      position: coords,

                  });

                  marker.setMap(map);
              });
          })

          $("#set-position").click(function () {
              
              map = new google.maps.Map(document.getElementById('map'), {
                  center: coords,
                  zoom: 17,
                  mapTypeId: 'roadmap'

              });
              marker = new google.maps.Marker({
                  position: coords,

              });
          })



///////////////////////////////////////////////////////////////////////////
        // Create the search box and link it to the UI element.

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

   


/**********FINESTRA PLAYER E AUDIO **********/
function showPlayerDiv(show){   //mostra o nasconde la finestra del player e audio
  var bar=document.getElementById('bar');
  if (show==true) {
    bar.style.visibility='visible';
  }else{
    bar.style.visibility='hidden';
  }

}
 
var urlvideo = ["FV-AmtffJpI", "1Z72j3W3eAc"]; //array con id dei video da riprodurre, creare funzione per popolarlo
var player;



function onYouTubeIframeAPIReady() {

    $("#playbutton").click(toggleAudio); //se clicchi sul pulsante chiama toogleAudio

    player = new YT.Player('youtube-player', { //lega il player al div "youtube-player"
    height: '0',
    width: '0',
    videoId: urlvideo[0], //url del video (stringa a 11 caratteri, dopo youtube.com/watch?v=)
    playerVars: {
      autoplay: 0,
      loop: 0,
    },
    });


    function toggleAudio() {
            if ( player.getPlayerState() == 1 || player.getPlayerState() == 3 ) {
              player.pauseVideo(); 
              togglePlayButton(false);
            } else {
              player.playVideo(); 
              togglePlayButton(true);
              } 
    } 

    function togglePlayButton(play) {    
      document.getElementById("playbutton").innerHTML = play ? "pause" : "play";
    }
  


      $("#video1button").click(function(){
        player.loadVideoById(urlvideo[0]);
        player.playVideo;
        togglePlayButton(true);
      }); 

      $("#video2button").click(function(){
        player.loadVideoById(urlvideo[1]);
        player.playVideo;
        togglePlayButton(true);
      }); 

      $("#nextbutton").click(function(){
      var index = urlvideo.indexOf(player.getVideoData()['video_id']);  //prendo l'indice del video che è in esecuzione
        if (index == urlvideo.length-1){ //se siamo sull'ultimo video
          player.loadVideoById(urlvideo[0]);
        }
        else{
          player.loadVideoById(urlvideo[index+1]);
        }
        player.playVideo;
        togglePlayButton(true);
      }); 

      $("#backbutton").click(function(){
        var index = urlvideo.indexOf(player.getVideoData()['video_id']);
        if (index-1<0){ //se siamo sul primo video
          player.loadVideoById(urlvideo[0]);
        }
        else{
          player.loadVideoById(urlvideo[index-1]);
        }
        player.playVideo;
        togglePlayButton(true);
      }); 
} 
