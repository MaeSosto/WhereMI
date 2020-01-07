//  if(navigator.geolocation){ //controllo se è presente la geolocalizzazione
//       navigator.geolocation.getCurrentPosition(initAutocomplete);
//   }else{
//       console.log('position not available'); //messaggio di errore se non è presente
//   }


/**************SETTAGGIO MAPPA*************/

// funzione pr l'inizializazione delle coordinate

function initCoords() {
	if (confirm("Vuoi usare la Geolocalizzazione?")) {
		navigator.geolocation.getCurrentPosition(initAutocomplete);
		document.getElementById('set-position').style.visibility="hidden";
	} else {
		document.getElementById('set-position').style.visibility="visible";
		var position = {
			coords: {
				latitude:44.4936714	,
				longitude:11.3430347
			}
		};
		initAutocomplete(position);
	}
}



function addToPlayer(oggetto){
	urlvideo=[];
	var arrayvideo=oggetto.video;
	for(var i=0; i<arrayvideo.length;i++){
		urlvideo.push(arrayvideo[i].url);
	}
	console.log(urlvideo);
	popolaDivVideo(arrayvideo);
	showPlayerDiv(true);
}

function popolaDivVideo(oggetto){
	$("#listavideodariprodurre").html(''); //elimino contenuto lista
	for(let video in oggetto){
		var titolo=oggetto[video].titolo.split("+");
		output = '<li id="' + oggetto[video].url + '" >' + titolo[1] + '</li>' ;
		$("#listavideodariprodurre").append(output); 

	}
	
}

function playThis(url){
	player.loadVideoById(url);
	player.playVideo;
	togglePlayButton(true);
}

function getVideos(lat, long){ //scorre il json finché non trova quel luogo e poi prende i suoi video e li aggiunge al player
	var luoghi=getJson();
	for(let luogo in luoghi){
		if (luoghi[luogo].coord.lat==lat && luoghi[luogo].coord.long==long){
			addToPlayer(luoghi[luogo]);
		}
	}
}
var map;
function initAutocomplete(position) {
	var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

	var directionsRenderer = new google.maps.DirectionsRenderer;
	var directionsService = new google.maps.DirectionsService;
	var geocoder = new google.maps.Geocoder();
	 map = creamappa(coords);

	
	//marker della tua posizione
	var marker = creaMarker(coords);
	marker.setMap(map);

	//marker dei luoghi 
	var luoghi=getJson();	
	for (let luogo in luoghi){
		cord= new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long);
		var temp=creaMarker2(cord);
		stampaMarker(temp, map);
	}

	function geocodeAddress(geocoder, resultsMap) {
		marker.setMap(null);
		var address = document.getElementById('pos').value;
		geocoder.geocode({
			'address': address
		}, function (results) {
			resultsMap.setCenter(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location)
		});
		showBar(false);
		return (marker)
	}

	function calculateAndDisplayRoute(directionsService, directionsRenderer) {
		var end = document.getElementById('end').value;
		directionsService.route({
			origin: marker.position,
			destination: end,
			travelMode: 'WALKING',

		}, function (response, status) {
			if (status === 'OK') {
				directionsRenderer.setDirections(response);
			} else {
				console.log(status);
			}
		});

	}

	directionsRenderer.setMap(map);
	//directionsRenderer.setPanel(document.getElementById('right-panel'));


	compiler(end, map);
	compiler(pos, map);
	compiler(newMarker, map);

	document.getElementById('newMarker').addEventListener('change', function () {
		StorageMarker(geocoder, map);
	});

	document.getElementById('end').addEventListener('change', function () {
		calculateAndDisplayRoute(directionsService, directionsRenderer, marker)
	});

	document.getElementById('pos').addEventListener('change', function () {
		marker = geocodeAddress(geocoder, map, marker);
		marker.setMap(map);
	});

	document.getElementById('reset-map').addEventListener('click', function () {
		map.setCenter(marker.position);
		map.setZoom(15)
	});

	google.maps.event.addListener(marker, 'dragend', function () {
		marker.setPosition(marker.getPosition());

	});

}

function compiler(input, map) {

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

function creamappa(coords) {
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: coords,
	});	
	return (map);
}
function creaMarker2(coords) { //crea marker dei luoghi
	var marker = new google.maps.Marker({
		position: coords,
		draggable: false,
		animation: google.maps.Animation.DROP,
		icon: {
			url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
		  }
	});

	google.maps.event.addListener(marker, 'click', function() { 
		getVideos(marker.position.lat(), marker.position.lng()); 
	}); 

	google.maps.event.addListener(marker, 'mouseover', function() { 
		var infowindow = new google.maps.InfoWindow({
			content: "click on marker"
		});
		infowindow.open(map, this);

		google.maps.event.addListener(marker, 'mouseout', function() { 
			infowindow.close(map, this);
		}); 
	}); 
	

	return marker;
}

function creaMarker(coords) { //crea marker posizione
	var marker = new google.maps.Marker({
		position: coords,
		draggable: true,
		animation: google.maps.Animation.DROP,
		id: "marker",
		icon: {
			url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
		  }
	});
	return marker;
}

function stampaMarker(marker, map) {
	marker.setMap(map);
}


function StorageMarker(geocoder, map) {
	var nome = document.getElementById('newMarker').value;
	var marker = addressconverter(geocoder, map, nome);
	var titolo = document.getElementById("titolo").value;
	var descrizione = document.getElementById("descrizione").value;
	var scopo = document.getElementById("scopo").value;
	var lingua = document.getElementById("lingua").value;
	var categoria = document.getElementById("categoria").value;
	var audience = document.getElementById("audience").value;
	var dettagli = document.getElementById("dettagli").value;

	Luogo(marker, lingua, audience, dettagli, descrizione, scopo, titolo, categoria)
}

function addressconverter(geocoder, resultsMap, address) {

	var results = geocoder.geocode({
		'address': address
	});

	function x(results) {
		var marker;
		resultsMap.setCenter(results[0].geometry.location);
		marker = creaMarker(results[0].geometry.location)
		return marker
	}

	return x(results);

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

function showPlayerDiv(show) { //mostra o nasconde la finestra del player e audio
	var divfiltro = document.getElementById('divfiltro');
	var divplayer = document.getElementById('divplayer');
	if (show == true) {
		divfiltro.style.display = 'block';
		divplayer.style.display = 'block';
	} else {
		divfiltro.style.display = 'none';
		divplayer.style.display = 'none';
	}

}

function showBar(show) { //mostra o nasconde la finestra del player e audio

	var bottone = document.getElementById('set-position');
	var barra = document.getElementById('pos');
	if (show == true) {
		bottone.style.visibility = 'hidden';
		barra.style.visibility = 'visible';
	} else {
		bottone.style.visibility = 'visible';
		barra.style.visibility = 'hidden';
	}

}


var urlvideo = []; //array con id dei video da riprodurre, creare funzione per popolarlo
var player;


function onYouTubeIframeAPIReady() {
	$("#playbutton").click(toggleAudio); //se clicchi sul pulsante chiama toogleAudio
	$("#pausebutton").click(toggleAudio); //se clicchi sul pulsante chiama toogleAudio

	player = new YT.Player('youtube-player', { //lega il player al div "youtube-player"
		height: '0',
		width: '0',
		videoId: "LD2wlSe5H1Q", //url del video (stringa a 11 caratteri, dopo youtube.com/watch?v=)
		playerVars: {
			autoplay: 0,
			loop: 0,
			origin:'https://site181964.tw.cs.unibo.it'
		},
	});


	function toggleAudio() {
		if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
			player.pauseVideo();
			togglePlayButton(false);
		} else {
			player.loadVideoById(urlvideo[0]);
			player.playVideo();
			togglePlayButton(true);
		}
	}

	 function togglePlayButton(play) {
	 	document.getElementById("playbutton").innerHTML = play ? "pause" : "play";
	 }


	$("#video1button").click(function () {
		player.loadVideoById(urlvideo[0]);
		player.playVideo;
		togglePlayButton(true);
	});

	$("#video2button").click(function () {
		player.loadVideoById(urlvideo[1]);
		player.playVideo;
		togglePlayButton(true);
	});

	$("#nextbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']); //prendo l'indice del video che è in esecuzione
		if (index == urlvideo.length - 1) { //se siamo sull'ultimo video
			player.loadVideoById(urlvideo[0]);
		} else {
			player.loadVideoById(urlvideo[index + 1]);
		}
		player.playVideo;
		togglePlayButton(true);
	});

	$("#backbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']);
		if (index - 1 < 0) { //se siamo sul primo video
			player.loadVideoById(urlvideo[0]);
		} else {
			player.loadVideoById(urlvideo[index - 1]);
		}
		player.playVideo;
		togglePlayButton(true);
	});
}

class Luogo {

	constructor(marker, lingua, audience, dettagli, descrizione, scopo, titolo, categoria) {
		this.marker = Marker
		this.lingua = lingua
		this.audience = audience
		this.dettagli = dettagli
		this.descrizione = descrizione
		this.scopo = scopo
		this.titolo = titolo
		this.categoria = categoria

	}

	getaudience() {
		return this.audience;
	}
	getlingua() {
		return this.lingua
	}
	getdettagli() {
		return this.dettagli;
	}
	getmarker() {
		return this.marker;
	}
	getdescrizione() {
		return this.descrizione;
	}
	getscopo() {
		return this.scopo
	}
	gettitolo() {
		return this.titolo
	}
	getcategoria() {
		return this.categoria
	}
}

function getJson(){ //funzione che ritorna il json con i luoghi
	var Path="/config/general.json";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", Path, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      var rresult = JSON.parse(xmlhttp.responseText);
	}
	
	return rresult;
}


/*************** FILTRO e creazione Luoghi **************/



function creaOggettofiltro() {

	var A = {
		categoria: document.getElementById("categoria").value,
		lingua: document.getElementById("selectDetail").value,
		audience: document.getElementById("selectAudience").value,
		scopo: document.getElementById("scopo").value,
		dettagli: document.getElementById("dettagli").value
	};
	return A;
}

function filtro() {
	var temp=new Array()
	var obj=getJson()
	var oggfiltro=creaOggettofiltro()
	console.log(oggfiltro);

	for(let luoghi in obj) {
		if(oggfiltro.lingua=='all')
		{oggfiltro.lingua = luoghi[obj].video[0].lingua;}
		if (oggfiltro.categoria == luoghi[obj].video[0].categoria && oggfiltro.lingua == luoghi[obj].video[0].lingua && oggfiltro.audience == luoghi[obj].video[0].audience && oggfiltro.scopo == luoghi[obj].video[0].scopo && oggfiltro.dettagli == luoghi[obj].video[0].dettagli) {
			temp.push(obj);//metto in un array tutti i video che rientrano nel filto
		}
	}
		var i=temp.length;
	for(var y=0;y<i;y++){
		addToPlayer(temp[y]);
	}


}
