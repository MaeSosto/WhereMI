//  if(navigator.geolocation){ //controllo se è presente la geolocalizzazione
//       navigator.geolocation.getCurrentPosition(initAutocomplete);
//   }else{
//       console.log('position not available'); //messaggio di errore se non è presente
//   }


/**************SETTAGGIO MAPPA*************/

// funzione pr l'inizializazione delle coordinate


var posizioneiniziale;
var posizioneattuale;
var posizionearrivo;
var LuoghiAlCaricamento;
var tuttiMarker = new Array;
var tuttiMarkerFiltrati=new Array;


function initCoords() {
	LuoghiAlCaricamento = getJson();
	if (confirm("Vuoi usare la Geolocalizzazione?")) {
		navigator.geolocation.getCurrentPosition(initAutocomplete);
		document.getElementById('set-position').style.display = 'none';
	} else {
		document.getElementById('set-position').style.display = 'block';
		var position = {
			coords: {
				latitude: 44.4936714,
				longitude: 11.3430347
			}
		};
		initAutocomplete(position);
	}
}



function addToPlayer(oggetto) {
	urlvideo = [];
	array = oggetto.video;
	for (var i = 0; i < array.length; i++) {
		urlvideo.push(array[i].url);
	}
	console.log(urlvideo);
	popolaDivVideo(oggetto);
	showPlayerDiv(true);
}

function popolaDivVideo(obj) {
	document.getElementById("titololuogo").innerHTML = obj.nome;
	var oggetto = obj.video;
	$("#listavideodariprodurre").html(''); //elimino contenuto lista
	$("#description").html(''); //elimino contenuto lista
	for (let video in oggetto) {
		var titolo = oggetto[video].titolo.split("+");
		var descrizione = oggetto[video].descrizione;
		outputTitolo = '<li id="' + oggetto[video].url + '" >' + titolo[1] + '</li>';
		outputDescrizione = '<li>' + descrizione + '</li>';
		$("#listavideodariprodurre").append(outputTitolo);
		$("#description").append(outputDescrizione);
	}

}


function getVideos(lat, long) { //scorre il json finché non trova quel luogo e poi prende i suoi video e li aggiunge al player
	var luoghi = getJson();
	for (let luogo in luoghi) {
		if (luoghi[luogo].coord.lat == lat && luoghi[luogo].coord.long == long) {
			addToPlayer(luoghi[luogo]);
		}
	}
}



var map;

function initAutocomplete(position) {
	var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	posizioneattuale = posizionearrivo = posizioneiniziale = coords;

	var directionsRenderer = new google.maps.DirectionsRenderer;
	var directionsService = new google.maps.DirectionsService;
	var geocoder = new google.maps.Geocoder();
	map = creamappa(coords);


	//marker della tua posizione
	var marker = creaMarker(coords);
	marker.setMap(map);

	//marker dei luoghi 
	var luoghi = getJson();
	for (let luogo in luoghi) {
		cord = new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long);
		stampaMarker(creaMarkerLuoghi(cord), map);

	}


	function creamappa(coords) {
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 15,
			center: coords,
		});
		return (map);
	}

	function creaMarkerLuoghi(coords) { //crea marker dei luoghi
		var marker = new google.maps.Marker({
			position: coords,
			draggable: false,
			animation: google.maps.Animation.DROP,
			id: "mark",
			icon: {
				url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
			}
		});

		google.maps.event.addListener(marker, 'click', function () {
			getVideos(marker.position.lat(), marker.position.lng());
			document.getElementById("skipbutton").value = marker.position.lat();
			document.getElementById("skipbutton").name = marker.position.lng();

		});

		google.maps.event.addListener(marker, 'mouseover', function () {
			for (var luogo in LuoghiAlCaricamento) {
				if (LuoghiAlCaricamento[luogo].coord.lat == marker.position.lat() && LuoghiAlCaricamento[luogo].coord.long == marker.position.lng()) {
					var infowindow = new google.maps.InfoWindow({
						content: LuoghiAlCaricamento[luogo].nome
					});
					infowindow.open(map, this);
				}

			}
			//GOTO CLIPS EVENT ON CLICK
			google.maps.event.addDomListener(marker, 'click', function () {
				window.location.href = '#gotoclips';
			});

			google.maps.event.addListener(marker, 'mouseout', function () {
				infowindow.close(map, this);
			});
		});

		tuttiMarker.push(marker);
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


	function geocodeAddress(geocoder, resultsMap, address) {
		marker.setMap(null);
		geocoder.geocode({
			'address': address
		}, function (results) {
			resultsMap.setCenter(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location)
			posizioneattuale = results[0].geometry.location;
			console.log(posizioneattuale)
		});
		showBar(false);
		return (marker)
	}

	directionsRenderer.setMap(map);
	//directionsRenderer.setPanel(document.getElementById('right-panel'));


	compiler(end, map);
	compiler(pos, map);


	document.getElementById('end').addEventListener('change', function () {
		directionsRenderer.set('directions', null);
		var arrivo = document.getElementById('end').value;
		calculateAndDisplayRoute(directionsService, directionsRenderer, posizioneattuale, arrivo);
	});

	document.getElementById('pos').addEventListener('change', function () {
		var address = document.getElementById('pos').value;
		directionsRenderer.set('directions', null);
		marker = geocodeAddress(geocoder, map, address);
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



function calculateAndDisplayRoute(directionsService, directionsRenderer, partenza, arrivo) {
	directionsService.route({

		origin: partenza,
		destination: arrivo,
		travelMode: 'WALKING',


	}, function (response, status) {
		if (status === 'OK') {

			directionsRenderer.setDirections(response);
			directionsRenderer.setOptions({
				suppressMarkers: true
			});
		} else {
			console.log(status);
		}
	});

}


function Evicino(position) {
	var array = new Array()
	var range = 4000;
	var luoghi = getJson();
	for (let luogo in luoghi) {
		var temp = new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long)
		var distanza = spherical.computeDistanceBetween(position, temp)
		if (distanza < range) {
			array.push(luoghi[luogo]);
		}
	}
	//array è un array di oggeti che identifica i luoghi più vicini
	//addToPlayer(array);
}

var arrayposizionivisitate = new Array();


var flag=true;
function nextLuogo(lat, lng) { //trova il luogo più vicino
	var position = new google.maps.LatLng(lat, lng); //luogo da cui fai skip
	var luogopiuvicino;
	var arraydistanza = new Array();
	var luoghi = getJson();
	var spherical = google.maps.geometry.spherical;
	
		if(arrayposizionivisitate.length==0){

		arrayposizionivisitate.push(position); //metto luogo da cui fai skip tra i visitati
		
		}
	for (let luogo in luoghi) {
		var t = true;
		var temp = new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long); //luogo nel json

		for (var i = 0; i < arrayposizionivisitate.length; i++) {

			if (arrayposizionivisitate[i].lat() == temp.lat() && arrayposizionivisitate[i].lng() == temp.lng()) {
				t = false
			}
		}

		if (position.lat() != temp.lat() && position.lng() != temp.lng() && t) {
			var distanza = spherical.computeDistanceBetween(position, temp);
			arraydistanza.push(distanza);
			if (distanza <= Math.min.apply(null, arraydistanza)) {
				luogopiuvicino = luoghi[luogo];

			}
		}
	}

	if (luogopiuvicino) { //finché non sono finiti i luoghi non visitati continuo
		var posizioneluogogiavisitato = new google.maps.LatLng(luogopiuvicino.coord.lat, luogopiuvicino.coord.long);
		for(var i=0; i<arrayposizionivisitate.length;i++){
			if(arrayposizionivisitate[i].lat()==posizioneluogogiavisitato.lat()&&arrayposizionivisitate[i].lng()==posizioneluogogiavisitato.lng()){
				flag=false;
			}

		}
	if (flag){
		arrayposizionivisitate.push(posizioneluogogiavisitato);
		
	}
		
	} else { //altrimenti riparto dal primo luogo e svuoto l'array
		luogopiuvicino = luoghi[Object.keys(luoghi)[0]]; //quando finiscono i luoghi ricomincia dal primo nel json
		arrayposizionivisitate = []; //e svuota l'array delle posizini visitate

	}



	return luogopiuvicino;
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
	var gotoFilter = document.getElementById('gotoFilter');
	if (show == true) {
		divfiltro.style.display = 'block';
		divplayer.style.display = 'block';
		gotoFilter.style.display = 'block';
	} else {
		divfiltro.style.display = 'none';
		divplayer.style.display = 'none';
		gotoFilter.style.display = 'none';
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


var urlvideo = []; //array con id dei video da riprodurre
var player;



function onYouTubeIframeAPIReady() {

	$("#playbutton").click(toggleAudio); //se clicchi sul pulsante chiama toogleAudio

	player = new YT.Player('youtube-player', { //lega il player al div "youtube-player"
		height: '0',
		width: '0',
		//url del video (stringa a 11 caratteri, dopo youtube.com/watch?v=)
		playerVars: {
			autoplay: 0,
			loop: 0,
			origin: 'https://site181964.tw.cs.unibo.it'
		},
	});

	player.addEventListener("onStateChange", function (state) {
		if (state.data === 0) {
			console.log("finito");
			togglePlayButton(false);
		}
	});


	function toggleAudio() {

		if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
			player.pauseVideo();
			togglePlayButton(false);
		} else {
			id = player.getVideoUrl().split("=")[1];
			if (!id) {
				player.loadVideoById(urlvideo[0]);
				for (var i = 0; i < urlvideo.length; i++) {
					document.getElementById(urlvideo[i]).style.color = "white";
				}
				document.getElementById(urlvideo[0]).style.color = "red";
			}

			player.playVideo();
			togglePlayButton(true);



		}
	}

	function togglePlayButton(play) {
		document.getElementById("playbutton").innerHTML = play ? "pause" : "play";
	}





	function makeAllWhite() {
		for (var i = 0; i < urlvideo.length; i++) {
			document.getElementById(urlvideo[i]).style.color = "white";
		}

	}
	$("#nextbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']); //prendo l'indice del video che è in esecuzione
		if (index == urlvideo.length - 1) { //se siamo sull'ultimo video
			player.loadVideoById(urlvideo[0]);
			makeAllWhite();
			document.getElementById(urlvideo[0]).style.color = "red";

		} else {
			player.loadVideoById(urlvideo[index + 1]);
			makeAllWhite();
			document.getElementById(urlvideo[index + 1]).style.color = "red";
		}
		player.playVideo;
		togglePlayButton(true);
	});

	$("#backbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']);
		if (index - 1 < 0) { //se siamo sul primo video
			player.loadVideoById(urlvideo[0]);
			makeAllWhite();
			document.getElementById(urlvideo[0]).style.color = "red";
		} else {
			player.loadVideoById(urlvideo[index - 1]);
			makeAllWhite();
			document.getElementById(urlvideo[index - 1]).style.color = "red";
		}
		player.playVideo;
		togglePlayButton(true);
	});



	$("#skipbutton").click(function () {


		//var directionsRenderer = new google.maps.DirectionsRenderer;
		//var directionsService = new google.maps.DirectionsService;
		//directionsRenderer.set('directions', null);
		var lat = document.getElementById("skipbutton").value;
		var lng = document.getElementById("skipbutton").name;
		//posizioneattuale = new google.maps.LatLng(lat, lng);
		var nxt = nextLuogo(lat, lng); 
		//var coord = new google.maps.LatLng(nxt.coord.lat, nxt.coord.long)
		//calculateAndDisplayRoute(directionsService, directionsRenderer, posizioneattuale, coord);
		//directionsRenderer.setMap(map);
		addToPlayer(nxt);
		document.getElementById("skipbutton").value = nxt.coord.lat;
		document.getElementById("skipbutton").name = nxt.coord.long;
		
		console.log(arrayposizionivisitate);
		
	});


	$("#prevbutton").click(function(){


		if (arrayposizionivisitate.length==0 ||arrayposizionivisitate.length==1){
			return 0;
		}
		for (luogo in LuoghiAlCaricamento){
			if (LuoghiAlCaricamento[luogo].coord.lat==arrayposizionivisitate[arrayposizionivisitate.length - 2].lat()&&LuoghiAlCaricamento[luogo].coord.long==arrayposizionivisitate[arrayposizionivisitate.length -2].lng()){
				addToPlayer(LuoghiAlCaricamento[luogo]);
				document.getElementById("skipbutton").value = LuoghiAlCaricamento[luogo].coord.lat;
			document.getElementById("skipbutton").name = LuoghiAlCaricamento[luogo].coord.long;
			}
		}
		
		arrayposizionivisitate.pop();
	});



}

function getJson() { //funzione che ritorna il json con i luoghi 
	var Path = "/config/general.json";
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", Path, false);
	xmlhttp.send();
	if (xmlhttp.status == 200) {
		var result = JSON.parse(xmlhttp.responseText);
	}
	return result;
}


/*************** FILTRO e creazione Luoghi **************/



function creaOggettofiltro() {

	var A = {
		lingua: document.getElementById("selectDetail").value,
		audience: document.getElementById("selectAudience").value,
		scopo: document.getElementById("scopo").value,
		dettagli: document.getElementById("dettagli").value
	};
	return A;
}


function SendFiltro(luogoInCuiSono) {
	var newObject = new Object;
	newObject.nome = luogoInCuiSono.nome;
	newObject.categoria = luogoInCuiSono.categoria;
	newObject.video = new Array;
	var oggfiltro = creaOggettofiltro();

	var arrayvideo = luogoInCuiSono.video;

	for (var i = 0; i < arrayvideo.length; i++) {

		if (oggfiltro.lingua == arrayvideo[i].lingua && oggfiltro.audience == arrayvideo[i].audience && oggfiltro.scopo == arrayvideo[i].scopo && oggfiltro.dettagli == arrayvideo[i].dettagli) {

			newObject.video.push(arrayvideo[i]);
		}

	}
	addToPlayer(newObject);



}

function filtro() {
	var luogoInCuiSono;
	var lat = document.getElementById("skipbutton").value;
	var lng = document.getElementById("skipbutton").name;
	obj = getJson();
	//console.log(LuoghiAlCaricamento["87928GF2+4F"]);
	for (let luogo in obj) {
		if (obj[luogo].coord.lat == lat && obj[luogo].coord.long == lng) {

			luogoInCuiSono = obj[luogo];
			console.log(luogoInCuiSono)
		}
	}

	SendFiltro(luogoInCuiSono);
}



window.onload = function () {
	var categoria = document.getElementById("categoria");
	categoria.addEventListener("change", function () {    //se cambio categoria filtro i marker

		filtraLuoghi(categoria.value);
	});
}

function filtraLuoghi(cat) {
	var luoghi = LuoghiAlCaricamento;

	for (var i = 0; i < tuttiMarker.length; i++) { //elimino tutti i marker 
		tuttiMarker[i].setMap(null);

	}
	for (var i = 0; i < tuttiMarkerFiltrati.length; i++) { //elimino tutti i marker precedentemente filtrati
		tuttiMarkerFiltrati[i].setMap(null);

	}

	if (cat=="all"){ //stampo tutti i luoghi 
		for (let luogo in luoghi) {
			cord = new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long);
			creaMarkerFiltrati(cord).setMap(map);
	
	
		}
	}

	for (let luogo in luoghi) { //creo marker dei luoghi con la categoria selezionata
		if (luoghi[luogo].categoria == cat) {
			cord = new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long);
			creaMarkerFiltrati(cord).setMap(map);
		}


	}

}





function creaMarkerFiltrati(coords) { //crea marker dei luoghi che sono stati filtrati 
	var marker = new google.maps.Marker({
		position: coords,
		draggable: false,
		animation: google.maps.Animation.DROP,
		icon: {
			url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
		}
	});

	google.maps.event.addListener(marker, 'click', function () {
		getVideos(marker.position.lat(), marker.position.lng());
		document.getElementById("skipbutton").value = marker.position.lat();
		document.getElementById("skipbutton").name = marker.position.lng();

	});

	google.maps.event.addListener(marker, 'mouseover', function () {
		for (var luogo in LuoghiAlCaricamento) {
			if (LuoghiAlCaricamento[luogo].coord.lat == marker.position.lat() && LuoghiAlCaricamento[luogo].coord.long == marker.position.lng()) {
				var infowindow = new google.maps.InfoWindow({
					content: LuoghiAlCaricamento[luogo].nome
				});
				infowindow.open(map, this);
			}

		}
		//GOTO CLIPS EVENT ON CLICK
		google.maps.event.addDomListener(marker, 'click', function () {
			window.location.href = '#gotoclips';
		});

		google.maps.event.addListener(marker, 'mouseout', function () {
			infowindow.close(map, this);
		});
	});
	tuttiMarkerFiltrati.push(marker);
	return marker;
}