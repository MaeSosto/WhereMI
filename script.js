


/*utilizzo la geolocalizzazione del browser per sapere la mia posizione*/

    if(navigator.geolocation){ //controllo se è presente la geolocalizzazione
        navigator.geolocation.getCurrentPosition(displayLocation); // chiamo il medoto getCurrentPosition che vuole come parametro la funzione che verrà chiamata per ricevere dati
    }else{
        console.log('position not available'); //messaggio di errore se non è presente
    }

  

    /*Faccio comparire la mappa*/
    
    function displayLocation(position){ //la funzione che viene chiamata quando il dato gli arriva e come parametro ha appunto il dato ricevuto
        var lonlat = [position.coords.latitude, position.coords.longitude];
        
        var mymap = L.map('mappa').setView([lonlat[0], lonlat[1]], 16);
        

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 1000,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiMTEzYW5kcml1c2NpYSIsImEiOiJjandxY214dXYxNm9nNGFvOGN5N3pudTJyIn0.6Xy1rhN4OCp1EqZcwxv8UA'
        }).addTo(mymap);
       
    var marker = L.marker([lonlat[0], lonlat[1]]).addTo(mymap);


       
    }
   

/* LOCATION IQ API*/ 

var api= 'https://us1.locationiq.com/v1/search.php?&q=';
var place= 'Empire%20State%20Building';
var key= '&key=6d98613eb84bd0';
var format='&format=json';

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": api+place+key+format,
        "method": "GET"
      }
      
      
        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    
     







/**************LOGIN********************/
    function toggleResetPswd(e){
        e.preventDefault();
        $('#logreg-forms .form-signin').toggle() // display:block or none
        $('#logreg-forms .form-reset').toggle() // display:block or none
    }
    
    function toggleSignUp(e){
        e.preventDefault();
        $('#logreg-forms .form-signin').toggle(); // display:block or none
        $('#logreg-forms .form-signup').toggle(); // display:block or none
    }
    
    $(()=>{
        // Login Register Form
        $('#logreg-forms #forgot_pswd').click(toggleResetPswd);
        $('#logreg-forms #cancel_reset').click(toggleResetPswd);
        $('#logreg-forms #btn-signup').click(toggleSignUp);
        $('#logreg-forms #cancel_signup').click(toggleSignUp);
        

    })

 /***********MENU MAPPA ***********/   

$(document).ready(function(){


    $("#button").click(function(){
        $("#menu").toggle(500);
  });
 
 
  $("#closebtn").click(function(){
    $("#menu").toggle(500);
});

   

})
    


/*un'altra funzione utile è watchPosition che cambia la posizione man mano
che quella cambia.
In questo video spiega bene: https://www.youtube.com/watch?v=pPAvL21kZQ0

Questa api è stata aggiunta seguendo l'esempio di: https://wiki.openstreetmap.org/wiki/OpenLayers_Marker_Example    
*/
