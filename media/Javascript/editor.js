

var audSave = document.getElementById('aud2'); //tag dove viene salvato l'audio registrato
var titolo, scopo, lingua, categoria, descrizione, audience, dettagli;
var player;
var divMetadati = document.getElementById("metadatiupload");


// Controllo sullo slider
var slider = document.getElementById("dettagli");
var output = document.getElementById("num_dettagli");
output.innerHTML = slider.value;
slider.oninput = function () {
	output.innerHTML = this.value;
}


function showAudio(show) { //mostra o nasconde il tag audio

	if (show == true) {
		// audio.style.visibility = 'visible';
		audSave.style.display = 'block';
		divMetadati.style.display = "block";
	} else {
		// audio.style.visibility = 'hidden';
		audSave.style.display = 'none';
		divMetadati.style.display = "none";
	}

}

function toggleRegistra(registra) { // cambia tasto registra
	document.getElementById("btnStart").innerHTML = registra ? "Registra" : "Stop";

}


let constraintObj = {
	audio: true,
	video: true
};

if (navigator.mediaDevices === undefined) {
	navigator.mediaDevices = {};
	navigator.mediaDevices.getUserMedia = function (constraintObj) {
		let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		if (!getUserMedia) {
			return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
		}
		return new Promise(function (resolve, reject) {
			getUserMedia.call(navigator, constraintObj, resolve, reject);
		});
	}
} else {
	navigator.mediaDevices.enumerateDevices()
		.then(devices => {
			devices.forEach(device => {
				console.log(device.kind.toUpperCase(), device.label);
				//, device.deviceId
			})
		})
		.catch(err => {
			console.log(err.name, err.message);
		})
}
navigator.mediaDevices.getUserMedia(constraintObj)
	.then(function (mediaStreamObj) {
		//connect the media stream to the first audio element
		let audio = document.querySelector('audio');
		if ("srcObject" in audio) {
			audio.srcObject = mediaStreamObj;
		} else {
			//old version
			audio.src = window.URL.createObjectURL(mediaStreamObj);
		}


		//add listeners for saving audio/audio
		let start = document.getElementById('btnStart');

		let mediaRecorder = new MediaRecorder(mediaStreamObj);
		let chunks = [];
		var started = false;


		start.addEventListener('click', (ev) => {
			if (started == false) {
				mediaRecorder.start();
				started = true;
				toggleRegistra(false);
				showAudio(false);

			} else {
				mediaRecorder.stop();
				started = false;
				toggleRegistra(true);
				showAudio(true);
			}

		})
		mediaRecorder.ondataavailable = function (ev) {
			chunks.push(ev.data); //salvo dati ricevuti in array
			console.log(ev.data);
		}
		mediaRecorder.onstop = (ev) => {
			let blob = new Blob(chunks, {
				'type': 'video/*;'
			}); //passo l'array all'oggetto blob che li salva nella variabile
			chunks = [];
			let audioURL = window.URL.createObjectURL(blob);
			audSave.src = audioURL;
		}
	})


///////////AUDIO DA PC////////

const recorder = document.getElementById('recorder');


recorder.addEventListener('change', function (e) {
	const file = e.target.files[0];
	const url = URL.createObjectURL(file);

	// Do something with the audio file.
	recorder.src = url;
});

/////////////////UPLOAD VIDEO PUBBLICI///////////////////


function callbackgoogle() {
    var autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('luogo'), {types: ['geocode']});
}


async function uploadYoutube() {

	titolo = "whereami+" + document.getElementById("titolo").value;
	descrizione = document.getElementById("descrizione").value;
	scopo = document.getElementById("scopo").value;
	lingua = document.getElementById("lingua").value;
	categoria = document.getElementById("categoria").value;
	audience = document.getElementById("audience").value;
	dettagli = document.getElementById("dettagli").value;

	
	var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('luogo').value;
    geocoder.geocode({ 'address': address}, function (results) {
		var latlong= new Object;
		var x=results[0].geometry.location;
		latlong.lat=x.lat();
		latlong.lng=x.lng();

		var metadatiClip = latlong.lat + ":" + latlong.lng +":"+ descrizione + ":" + scopo + ":" + lingua + ":" + categoria + ":" + audience + ":" + dettagli;
		console.log(metadatiClip);

		var success =  window.uploadToYoutube(audSave.src || recorder.src, titolo, metadatiClip, latlong);
		if (success) {
			alert("caricato");
		}
	
		
	});


	
}

window.uploadToYoutube = async function (urlClip, titolo, metadati, latlong) {
	//Ottieni clip video da URL (hosted cloudinary.com)
	let response = await fetch(urlClip);
	var rawData = await response.blob();
	rawData.type = 'video/mp4';
	console.log("Preparo invio dati a Youtube (API)", rawData);
	uploadRawFile(rawData, titolo, metadati, latlong);
	return true;
}


async function uploadRawFile(videoclip, titolo, metadatiClip, latlong) {
	var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
	var params = {
		snippet: {
			categoryId: 27,
			title: titolo,
			description: metadatiClip,
			tags: [metadatiClip]
		},
		status: {
			privacyStatus: 'public',
			embeddable: true
		}
	};

	//Building request
	var request = new FormData();
	var metadatiYoutube = new Blob([JSON.stringify(params)], {
		type: 'application/json'
	});
	request.append('video', metadatiYoutube);
	request.append('mediaBody', videoclip);

	//Upload via API youtube (POST)


	$.ajax({
			method: 'POST',
			url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token=' + encodeURIComponent(token) +
				'&part=snippet,status',
			data: request,
			cache: false,
			contentType: false,
			processData: false,
		})
		.done(function (response) {
			console.log("Caricamento completato! YouTube:", response)
			isPresente(latlong.lat, latlong.lng, response.id);
			return true;
		})
		.fail(function (response) {
			var errors = response.responseJSON.error.errors[0];
			console.log("Errore API per Upload YT!", errors);
			return false;
		});


}
/////////////////UPLOAD VIDEO PRIVATI//////////////////////////////////////

async function uploadYoutubePrivate() {

	titolo = "whereami+" + document.getElementById("titolo").value;
	descrizione = document.getElementById("descrizione").value;
	scopo = document.getElementById("scopo").value;
	lingua = document.getElementById("lingua").value;
	categoria = document.getElementById("categoria").value;
	audience = document.getElementById("audience").value;
	dettagli = document.getElementById("dettagli").value;



	
	var geocoder = new google.maps.Geocoder();
    var address = document.getElementById('luogo').value;
    geocoder.geocode({ 'address': address}, function (results) {
		var latlong= new Object;
		var x=results[0].geometry.location;
		latlong.lat=x.lat();
		latlong.lng=x.lng();

		var metadatiClip = latlong.lat + ":" + latlong.lng +":"+ descrizione + ":" + scopo + ":" + lingua + ":" + categoria + ":" + audience + ":" + dettagli;
		console.log(metadatiClip);

		var success = window.uploadToYoutubePrivate(audSave.src || recorder.src, titolo, metadatiClip);
		if (success) {
			alert("caricato");
		}
	
		
	});

}

window.uploadToYoutubePrivate = async function (urlClip, titolo, metadati) {
	//Ottieni clip video da URL (hosted cloudinary.com)
	let response = await fetch(urlClip);
	var rawData = await response.blob();
	rawData.type = 'video/mp4';
	console.log("Preparo invio dati a Youtube (API)", rawData);
	uploadRawFilePrivate(rawData, titolo, metadati);
	return true;
}


async function uploadRawFilePrivate(videoclip, titolo, metadatiClip) {
	var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
	var params = {
		snippet: {
			categoryId: 27,
			title: titolo,
			description: metadatiClip,
			tags: [metadatiClip]
		},
		status: {
			privacyStatus: 'unlisted',
			embeddable: true
		}
	};

	//Building request
	var request = new FormData();
	var metadatiYoutube = new Blob([JSON.stringify(params)], {
		type: 'application/json'
	});
	request.append('video', metadatiYoutube);
	request.append('mediaBody', videoclip);

	//Upload via API youtube (POST)


	$.ajax({
			method: 'POST',
			url: 'https://www.googleapis.com/upload/youtube/v3/videos?access_token=' + encodeURIComponent(token) +
				'&part=snippet,status',
			data: request,
			cache: false,
			contentType: false,
			processData: false,
		})
		.done(function (response) {
			console.log("Caricamento completato! YouTube:", response)
			return true;
		})
		.fail(function (response) {
			var errors = response.responseJSON.error.errors[0];
			console.log("Errore API per Upload YT!", errors);
			return false;
		});


}

/////aggiorna JSON e carica video

function getJson(){ //funzione che ritorna il json con i luoghi
	var Path="/config/general.json";
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", Path, false);                 ///////////ERA FALSE QUANDO FUNZIONAVA
    xmlhttp.send();
    if (xmlhttp.status==200) {
      var rresult = JSON.parse(xmlhttp.responseText);
	}
	
	return rresult;
}

function getCoords(code){ // converte plus code in coordinate
	var urlCodereverse = "https://plus.codes/api?address=" + code+ "&ekey=AIzaSyAisQVJRCJqUAW-wICyJbshSxg_jPL-Y-A"; //URL API di OLC(Plus code)
	let stringa=[];
	$.ajax({
		type: "GET",
		async: false,
		url: urlCodereverse,
		success: function(code){
			console.log(code);
			stringa[0] = code.plus_code.geometry.location.lat;
			stringa[1] = code.plus_code.geometry.location.lng;
		}
	 });
	 
	return stringa;
}


function getOLC(lat, long){ // converte coordinate in plus code
	var urlCodereverse = "https://plus.codes/api?address=" + lat +","+ long + "&ekey=AIzaSyAisQVJRCJqUAW-wICyJbshSxg_jPL-Y-A"; //URL API di OLC(Plus code)
	let stringa="non ha convertito in olc";
	$.ajax({
		type: "GET",
		async: false,
		url: urlCodereverse,
		success: function(code){
			console.log(code);
			stringa = code.plus_code.global_code;
		}
	 });
	 
	return stringa;
}

function generateRandomString(iLen) {
    var sRnd = '';
    var sChrs = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    for (var i = 0; i < iLen; i++) {
      var randomPoz = Math.floor(Math.random() * sChrs.length);
      sRnd += sChrs.substring(randomPoz, randomPoz + 1);
    }
    return sRnd;
  }



function aggiornaJson(oggetto){ //funzione che aggiorna il json con il nuovo oggetto
	$.ajax({
		type: "POST",
		url: "/config/general.json",
		data: oggetto,
	 });

}

var check = null; // controllo per la funzione

function isPresente(lat, long, urlvideo){ //funzione che controlla se quel luogo esiste già e aggiunge i dati di conseguenza
	var luoghi=getJson();
	
	for(let luogo in luoghi){
		
		if (luoghi[luogo].coord.lat==lat && luoghi[luogo].coord.long==long){
			check= luogo; // salvo il luogo dove inserire i dati
		}
	}
		
	if (check!=null){
		insertHere(check, urlvideo, luoghi); 
	}
	else{
		creaNuovo(lat, long, urlvideo, luoghi);
	}
	check=null;
}


function insertHere(nome, urlvideo, luoghi){
	luoghi[nome].video.push(urlvideo);
	aggiornaJson(luoghi);
}

function creaNuovo(lat, long, urlvideo, luoghi){
	//var code = generateRandomString(10);
	var code= getOLC(lat, long);
	luoghi[code]=new Object;
	luoghi[code].coord= new Object;
	luoghi[code].video= new Array;
	luoghi[code].coord.lat=lat;
	luoghi[code].coord.long=long;
	luoghi[code].video.push(urlvideo);
	aggiornaJson(luoghi);
	
}

$("#upload").click(function () {
	divMetadati.style.display = 'none';
	//TODO: refreshare i campi 
	uploadYoutube();
});

$("#salva").click(function () {
	divMetadati.style.display = 'none';
	//TODO: refreshare i campi 
	uploadYoutubePrivate();
});


function getPlaylist() {

	$("#videosalvatilist").html(''); //elimino contenuto lista prima di caricarla

	var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
	$.get(
		"https://www.googleapis.com/youtube/v3/channels?access_token=" + encodeURIComponent(token), {
			part: 'contentDetails',
			mine: true,
		},
		function (data) {
			$.each(data.items, function (i, item) {

				var videos = item.contentDetails.relatedPlaylists.uploads;
				getVids(videos);
			})
		}
	)


}


function getVids(videos) { //funzione che crea la lista di video salvati 
	var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
	$.get(
		"https://www.googleapis.com/youtube/v3/playlistItems?access_token=" + encodeURIComponent(token), {
			part: 'snippet, status',
			maxResults: 20,
			playlistId: videos
		},
		function (data) {
			$.each(data.items, function (i, item) {
				var titolo= item.snippet.title;
				arrStr=titolo.split("+");       //ogni video privato caricato col nostro sito ha "whereami" nel titolo seguito da un + perciò divito la stringa
				if (item.status.privacyStatus == "unlisted" && arrStr[0]=="whereami") { //seleziono solo i video unlisted del canale
					output = '<li id="' + item.snippet.resourceId.videoId + item.snippet.resourceId.videoId + '">' + arrStr[1] + '</li>' +
						'<button type= "button"  id="' + item.snippet.resourceId.videoId + item.snippet.resourceId.videoId + item.snippet.resourceId.videoId + '">Play</button>' +
						'<button type= "button" id="' + item.snippet.resourceId.videoId + '">Carica</button>';
					$("#videosalvatilist").append(output); //aggiungo nomi e button alla lista dei video

					document.getElementById(item.snippet.resourceId.videoId + item.snippet.resourceId.videoId + item.snippet.resourceId.videoId).onclick = function () { //riproduco il video salvato selezionato
						addToPlayer(item.snippet.resourceId.videoId);
					}
					document.getElementById(item.snippet.resourceId.videoId).onclick = function () {

						gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest") //aggiungo all'oggetto client la possibilità di accedere ai video di youtube

							.then(function () {
								//aggiorno privacyStatus video youtube
								var request = gapi.client.youtube.videos.update({
									id: item.snippet.resourceId.videoId,
									part: 'status',
									status: {
										privacyStatus: 'public'
									}
								});

								request.execute(function (response) {
									console.log(response);
								});
								// elimino dalla lista il video che è stato appena caricato e i suoi tasti
								var listId = item.snippet.resourceId.videoId + item.snippet.resourceId.videoId;
								var playId = item.snippet.resourceId.videoId + item.snippet.resourceId.videoId + item.snippet.resourceId.videoId;
								var caricaId = item.snippet.resourceId.videoId;
								$("#" + listId).remove();
								$("#" + playId).remove();
								$("#" + caricaId).remove();

								var latlong = item.snippet.description.split(":");
								isPresente(latlong[0], latlong[1], item.snippet.resourceId.videoId); 
								console.log("il video è publico");
							})
					}
				}
			})

		}
	)
}
$("#tastovideosalvati").click(function () {

	getPlaylist();
	
});


////////PLAYER PER SENTIRE VIDEO SALVATI////////

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function () {


	player = new YT.Player('youtube-player2', { //lega il player al div "youtube-player2"
		height: '0',
		width: '0',
		videoId: "eieeowLz-Ms", //url del video (stringa a 11 caratteri, dopo youtube.com/watch?v=)
		playerVars: {
			autoplay: 0,
			loop: 0,
		},
	});


}


function addToPlayer(id) {
	if (player) {
		player.loadVideoById(id);
		player.playVideo();
		console.log(id);
	} else {
		console.log("variabile player non creata");
	}
}


