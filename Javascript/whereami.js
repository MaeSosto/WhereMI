
    
     
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

          var directionsRenderer = new google.maps.DirectionsRenderer;
          var directionsService = new google.maps.DirectionsService;
          var geocoder = new google.maps.Geocoder();
          var map=creamappa(coords);
          var marker=creaMarker(coords);

          marker.setMap(map);

          function geocodeAddress(geocoder, resultsMap) {
              marker.setMap(null);
              var address = document.getElementById('pos').value;
              geocoder.geocode({'address': address}, function (results) {
                  resultsMap.setCenter(results[0].geometry.location);
                  marker = new google.maps.Marker({
                      map: resultsMap,
                      position: results[0].geometry.location,
                      draggable:true,
                      id: "marker"
                  });
              });
              showBar(false);
              return(marker)
          }

          directionsRenderer.setMap(map);
          //directionsRenderer.setPanel(document.getElementById('right-panel'));


          compiler(end,map);
          compiler(pos,map);

          document.getElementById('end').addEventListener('change', function () {
              calculateAndDisplayRoute(directionsService, directionsRenderer,marker)
          });

          document.getElementById('pos').addEventListener('change', function() {

              marker=geocodeAddress(geocoder, map,marker);
              marker.setMap(map);
          });

          document.getElementById('reset-map').addEventListener('click',function () {
             map.setCenter(marker.position);
          });

          google.maps.event.addListener(marker, 'dragend', function() {
              marker.setPosition(marker.getPosition());

      });

      }


    function calculateAndDisplayRoute(directionsService, directionsRenderer,marker) {
        var end = document.getElementById('end').value;
        directionsService.route({
            origin:marker.position,
            destination: end,
            travelMode: 'WALKING',
            
        }, function(response, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
            } else{
                console.log(status);
            }
        });

    }



    function compiler(input,map) {

        var searchBox = new google.maps.places.SearchBox(input);
        map.controls.push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });

        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

        })
    }

    function creamappa(coords){
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 11,
            center: coords,
        });
        return(map);
    }

    function creaMarker(coords) {
        var marker=new google.maps.Marker({
            position: coords,
            draggable: true,
            id: "marker"
        });
        return marker;
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

    function showBar(show){   //mostra o nasconde la finestra del player e audio

        var bottone=document.getElementById('set-position');
        var barra=document.getElementById('pos');
        if (show==true) {
            bottone.style.visibility='hidden';
            barra.style.visibility='visible';
        }else{
            bottone.style.visibility='visible';
            barra.style.visibility='hidden';
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
