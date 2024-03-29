/**************SETTAGGIO MAPPA*************/

var posizioneattuale; //posizione iniziale
var LuoghiAlCaricamento; //oggetto con tutti i luoghi presenti nel json
var tuttiMarker = new Array; //array con posizioni di tutti i marker 
var tuttiMarkerFiltrati = new Array; //array con posizioni di marker filtrati per categoria

function initCoords() { //geolocalizza l'utente o apre la mappa a Bologna in assenza della posizione
	LuoghiAlCaricamento = getJson();
	navigator.geolocation.getCurrentPosition(initAutocomplete, function (error) { //chiama initAutocodramplete con la tua posizione, senza consenso alla posizione ti porta a bologna
		if (error.code == error.PERMISSION_DENIED) {
			var position = {
				coords: {
					latitude: 44.4936714, //posizione di Bologna
					longitude: 11.3430347
				}
			};
			initAutocomplete(position);
		}
	});


}


var map;
var directionsRenderer;
function initAutocomplete(position) { // crea mappa e marker con tutte le loro funzionalità

	var coords = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	posizioneattuale = coords;
	directionsRenderer = new google.maps.DirectionsRenderer; //servizi di google per la creazione di strade
	var directionsService = new google.maps.DirectionsService; //servizi di google per la creazione di strade
	var geocoder = new google.maps.Geocoder(); //servizio di google che converte luoghi in coordinate

	//crea l'oggetto mappa
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 15,
		center: coords,
	});


	//marker della tua posizione
	var marker = creaMarker(coords);
	marker.setMap(map);

	//marker dei luoghi 
	var luoghi = getJson();
	for (let luogo in luoghi) {
		cord = new google.maps.LatLng(luoghi[luogo].coord.lat, luoghi[luogo].coord.long);
		stampaMarker(creaMarkerLuoghi(cord), map);

	}


	function creaMarkerLuoghi(coords) { //crea marker dei luoghi
		var marker = new google.maps.Marker({
			position: coords,
			draggable: false,
			animation: google.maps.Animation.DROP,
			id: "mark",
			icon: {
				url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
			}
		});

		google.maps.event.addListener(marker, 'click', function () { // al click apre il player con i video di quel posto
			var directionsService = new google.maps.DirectionsService;
			getVideos(marker.position.lat(), marker.position.lng());
			directionsRenderer.set('directions', null);
			var posizioneclick= new google.maps.LatLng( marker.position.lat(), marker.position.lng());
			calculateAndDisplayRoute(directionsService,directionsRenderer,posizioneattuale,posizioneclick)
			//salvo la posizione del marker cliccato
			document.getElementById("skipbutton").value = marker.position.lat();
			document.getElementById("skipbutton").name = marker.position.lng();

		});

		google.maps.event.addListener(marker, 'mouseover', function () { //mostra un popup con il nome del posto
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
			google.maps.event.addListener(marker, 'mouseout', function () { //chiudo il popup
				infowindow.close(map, this);
			});
		});

		tuttiMarker.push(marker); //aggiungo all'array di tutti i marker
		return marker;
	}

	function creaMarker(coords) { //crea marker posizione
		var marker = new google.maps.Marker({
			position: coords,
			draggable: true,
			animation: google.maps.Animation.DROP,
			id: "marker",
			icon: {
				url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
			}
		});
		return marker;
	}

	function stampaMarker(marker, map) {
		marker.setMap(map);
	}


	function geocodeAddress(geocoder, resultsMap, address) { //trasforma un indirizzo in un dato LatLng
		marker.setMap(null);
		geocoder.geocode({
			'address': address
		}, function (results) {
			resultsMap.setCenter(results[0].geometry.location);
			marker.setPosition(results[0].geometry.location)
			posizioneattuale = results[0].geometry.location;

		});
		showBar(false);
		return (marker)
	}

	directionsRenderer.setMap(map);
	//directionsRenderer.setPanel(document.getElementById('right-panel'));


	compiler(end, map);
	compiler(pos, map);


	document.getElementById('end').addEventListener('change', function () { //crea il percorso dalla tua posizione a quella desiderata
		directionsRenderer.set('directions', null);
		var arrivo = document.getElementById('end').value;
		console.log(posizioneattuale)
		calculateAndDisplayRoute(directionsService, directionsRenderer, posizioneattuale, arrivo);
		document.getElementById("end").value="";
	});

	document.getElementById('pos').addEventListener('change', function () { //cambia il tuo luogo di partrenza
		var address = document.getElementById('pos').value;
		directionsRenderer.set('directions', null);
	
		marker = geocodeAddress(geocoder, map, address);
		
		marker.setMap(map);
		map.setZoom(15)
	});

	document.getElementById('reset-map').addEventListener('click', function () { //sposta la visuale della mappa alla posizione di partenza
		map.setCenter(marker.position);
		map.setZoom(15)
	});

	google.maps.event.addListener(marker, 'dragend', function () { //setta la tua posizione dopo che hai spostato il marker
		directionsRenderer.set('directions', null);
		marker.setPosition(marker.getPosition());
		posizioneattuale=marker.getPosition();

	});

}

function compiler(input, map) { // funzione che autocompila i textbox in base alla visualizzazione della mappa 

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

function calculateAndDisplayRoute(directionsService, directionsRenderer, partenza, arrivo) { //cerca e crea il percorso per arrivare ad un posto
	
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
			alert("No route found");
		}
	});

}


function getVideos(lat, long) { //scorre il json finché non trova quel luogo e poi prende i suoi video e li aggiunge al player
	var luoghi = getJson();
	for (let luogo in luoghi) {
		if (luoghi[luogo].coord.lat == lat && luoghi[luogo].coord.long == long) {
			addToPlayer(luoghi[luogo]);
		}
	}
}


function addToPlayer(oggetto) {
	urlvideo = [];
	array = oggetto.video;
	for (var i = 0; i < array.length; i++) {
		urlvideo.push(array[i].url);
	}
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

function showPlayerDiv(show) { //mostra o nasconde la finestra del player e audio
	var divfiltro = document.getElementById('divfiltro');
	var divplayer = document.getElementById('divplayer');
	var gotoFilter = document.getElementById('gotoFilter');
	if (show == true) {
		divfiltro.style.display = 'block';
		divplayer.style.display = 'block';
	} else {
		divfiltro.style.display = 'none';
		divplayer.style.display = 'none';
	}

}




/**********FINESTRA PLAYER E AUDIO **********/




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
					document.getElementById(urlvideo[i]).style.color = "black";
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





	function makeAllBlack() {
		for (var i = 0; i < urlvideo.length; i++) {
			document.getElementById(urlvideo[i]).style.color = "black";
		}

	}
	$("#nextbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']); //prendo l'indice del video che è in esecuzione
		if (index == urlvideo.length - 1) { //se siamo sull'ultimo video
			player.loadVideoById(urlvideo[0]);
			makeAllBlack();
			document.getElementById(urlvideo[0]).style.color = "red";

		} else {
			player.loadVideoById(urlvideo[index + 1]);
			makeAllBlack();
			document.getElementById(urlvideo[index + 1]).style.color = "red";
		}
		player.playVideo;
		togglePlayButton(true);
	});

	$("#backbutton").click(function () {
		var index = urlvideo.indexOf(player.getVideoData()['video_id']);
		if (index - 1 < 0) { //se siamo sul primo video
			player.loadVideoById(urlvideo[0]);
			makeAllBlack();
			document.getElementById(urlvideo[0]).style.color = "red";
		} else {
			player.loadVideoById(urlvideo[index - 1]);
			makeAllBlack();
			document.getElementById(urlvideo[index - 1]).style.color = "red";
		}
		player.playVideo;
		togglePlayButton(true);
	});

	

	$("#skipbutton").click(function () {


		var directionsService = new google.maps.DirectionsService;
		directionsRenderer.set('directions', null);
		var lat = document.getElementById("skipbutton").value;
		var lng = document.getElementById("skipbutton").name;
		var posizionemomentanea = new google.maps.LatLng(lat, lng);
		var nxt = nextLuogo(lat, lng);
		var coord = new google.maps.LatLng(nxt.coord.lat, nxt.coord.long)
		calculateAndDisplayRoute(directionsService, directionsRenderer, posizionemomentanea, coord);
		directionsRenderer.setMap(map);
		addToPlayer(nxt);
		document.getElementById("skipbutton").value = nxt.coord.lat;
		document.getElementById("skipbutton").name = nxt.coord.long;


	});


	$("#prevbutton").click(function () {

		var directionsService = new google.maps.DirectionsService;
		directionsRenderer.set('directions', null);
		var posizioneprecedente = arrayposizionivisitate[arrayposizionivisitate.length - 1]
		if (arrayposizionivisitate.length == 0 || arrayposizionivisitate.length == 1) {
			return 0;
		}
		for (luogo in LuoghiAlCaricamento) {
			if (LuoghiAlCaricamento[luogo].coord.lat == arrayposizionivisitate[arrayposizionivisitate.length - 2].lat() && LuoghiAlCaricamento[luogo].coord.long == arrayposizionivisitate[arrayposizionivisitate.length - 2].lng()) {
				addToPlayer(LuoghiAlCaricamento[luogo]);
				var posizionemomentanea = new google.maps.LatLng(LuoghiAlCaricamento[luogo].coord.lat, LuoghiAlCaricamento[luogo].coord.long);
				calculateAndDisplayRoute(directionsService, directionsRenderer, posizioneprecedente,posizionemomentanea);
				directionsRenderer.setMap(map);
				document.getElementById("skipbutton").value = LuoghiAlCaricamento[luogo].coord.lat;
				document.getElementById("skipbutton").name = LuoghiAlCaricamento[luogo].coord.long;
			}
		}

		arrayposizionivisitate.pop();

	});



}


var arrayposizionivisitate = new Array(); // array usato per controllare i luoghi che hai gia visitato
var flag = true;

function nextLuogo(lat, lng) { //trova il luogo più vicino
	var position = new google.maps.LatLng(lat, lng); //luogo da cui fai skip
	var luogopiuvicino;
	var arraydistanza = new Array();
	var luoghi = getJson();
	var spherical = google.maps.geometry.spherical;

	if (arrayposizionivisitate.length == 0) {

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
		for (var i = 0; i < arrayposizionivisitate.length; i++) {
			if (arrayposizionivisitate[i].lat() == posizioneluogogiavisitato.lat() && arrayposizionivisitate[i].lng() == posizioneluogogiavisitato.lng()) {
				flag = false;
			}

		}
		if (flag) {
			arrayposizionivisitate.push(posizioneluogogiavisitato);

		}

	} else { //altrimenti riparto dal primo luogo e svuoto l'array
		luogopiuvicino = luoghi[Object.keys(luoghi)[0]]; //quando finiscono i luoghi ricomincia dal primo nel json
		arrayposizionivisitate = []; //e svuota l'array delle posizini visitate

	}



	return luogopiuvicino;
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


/*************** FILTRI **************/



function getValuesFiltro() { //crea un oggetto con i campi selezionati

	var A = {
		lingua: document.getElementById("selectlingua").value,
		audience: document.getElementById("selectAudience").value,
		scopo: document.getElementById("scopo").value,
	};
	return A;
}


function filtraVideo(luogoInCuiSono) {
	var newObject = new Object;
	newObject.nome = luogoInCuiSono.nome;
	newObject.categoria = luogoInCuiSono.categoria;
	newObject.video = new Array;
	var oggfiltro = getValuesFiltro();
	for (campo in oggfiltro) {

	}

	var arrayvideo = luogoInCuiSono.video;

	for (var i = 0; i < arrayvideo.length; i++) {
		//caso in cui tutti i campi sono vuoti
		if (oggfiltro.lingua == "" && oggfiltro.audience == "" && oggfiltro.scopo == "") {
			newObject.video.push(arrayvideo[i]);
		}
		//casi in cui due dei tre campi sono vuoti
		else if (oggfiltro.audience == "" && oggfiltro.scopo == "" && oggfiltro.lingua != "") {
			if (oggfiltro.lingua == arrayvideo[i].lingua) {
				newObject.video.push(arrayvideo[i]);
			}
		} else if (oggfiltro.lingua == "" && oggfiltro.scopo == "" && oggfiltro.audience != "") {
			if (oggfiltro.audience == arrayvideo[i].audience) {
				newObject.video.push(arrayvideo[i]);
			}
		} else if (oggfiltro.audience == "" && oggfiltro.lingua == "" && oggfiltro.scopo != "") {
			if (oggfiltro.scopo == arrayvideo[i].scopo) {
				newObject.video.push(arrayvideo[i]);
			}
		}
		//casi in cui solo un campo dei tre è vuoto
		else if (oggfiltro.audience == "" && oggfiltro.lingua != "" && oggfiltro.scopo != "") {
			if (oggfiltro.scopo == arrayvideo[i].scopo && oggfiltro.lingua == arrayvideo[i].lingua) {
				newObject.video.push(arrayvideo[i]);
			}
		} else if (oggfiltro.audience != "" && oggfiltro.lingua == "" && oggfiltro.scopo != "") {
			if (oggfiltro.scopo == arrayvideo[i].scopo && oggfiltro.audience == arrayvideo[i].audience) {
				newObject.video.push(arrayvideo[i]);
			}
		} else if (oggfiltro.audience != "" && oggfiltro.lingua != "" && oggfiltro.scopo == "") {
			if (oggfiltro.lingua == arrayvideo[i].lingua && oggfiltro.audience == arrayvideo[i].audience) {
				newObject.video.push(arrayvideo[i]);
			}
		}
		//caso in cui tutti i campi sono compilati
		else if (oggfiltro.audience != "" && oggfiltro.lingua != "" && oggfiltro.scopo != "") {
			if (oggfiltro.lingua == arrayvideo[i].lingua && oggfiltro.audience == arrayvideo[i].audience && oggfiltro.scopo == arrayvideo[i].scopo) {
				newObject.video.push(arrayvideo[i]);
			}
		}


	}
	addToPlayer(newObject);



}



window.onload = function () {
	var categoria = document.getElementById("categoria");
	categoria.addEventListener("change", function () { //se cambio categoria filtro i marker

		filtraLuoghi(categoria.value);
	});



	$("#filtraButton").click(function () {
		var luogoInCuiSono;
		var lat = document.getElementById("skipbutton").value;
		var lng = document.getElementById("skipbutton").name;
		obj = getJson();
		for (let luogo in obj) {
			if (obj[luogo].coord.lat == lat && obj[luogo].coord.long == lng) { //cerco il luogo con quelle coordinate

				luogoInCuiSono = obj[luogo];
			}
		}

		filtraVideo(luogoInCuiSono);
	});

	$("#buttonfiltro").click(function () { //apre o chiude il div del filtro
		var display = document.getElementById("openFilter").style.display;
		if (display == "none") {
			document.getElementById("openFilter").style.display = "block";
		} else {
			document.getElementById("openFilter").style.display = "none";
		}
	});

}

function filtraLuoghi(cat) { //filtra i marker in base alla categoria
	var luoghi = LuoghiAlCaricamento;

	for (var i = 0; i < tuttiMarker.length; i++) { //elimino tutti i marker 
		tuttiMarker[i].setMap(null);

	}
	for (var i = 0; i < tuttiMarkerFiltrati.length; i++) { //elimino tutti i marker precedentemente filtrati
		tuttiMarkerFiltrati[i].setMap(null);

	}

	if (cat == "all") { //stampo tutti i luoghi 
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
