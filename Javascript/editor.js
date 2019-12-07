var audSave = document.getElementById('aud2');
var titolo, scopo, lingua, categoria, descrizione, audience, dettagli;








// Controllo sullo slider
var slider = document.getElementById("dettagli");
var output = document.getElementById("num_dettagli");
output.innerHTML = slider.value;
slider.oninput = function () {
    output.innerHTML = this.value;
}



function showAudio(show) { //mostra o nasconde il tag audio
    var audio = document.getElementById('aud2');
    if (show == true) {
        // audio.style.visibility = 'visible';
        audio.style.display = 'block';
    } else {
        // audio.style.visibility = 'hidden';
        audio.style.display = 'none';
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









///////////////CARICAMENTO YOUTUBE////////////////



const API_KEY = "AIzaSyAisQVJRCJqUAW-wICyJbshSxg_jPL-Y-A";
const CLIENT_ID = "600073852662-qiaidgofjs1bt8dpd1jgm3tbk72sdlej.apps.googleusercontent.com";


// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/people/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
var utenteButton = document.getElementById('buttonLogin');
var update = document.getElementById('update');


function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        //alert("Sign-in successful");
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
        if (utenteButton) {
            utenteButton.onclick = handleAuthClick;
        }
    }, function (err) {
        console.error("Error loading GAPI client for API", err);
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';

        //Elementi statici presenti solo nel editor
        if (utenteButton || update) {
            utenteButton.style.display = 'none';
            update.disabled = false;
        }
        //document.getElementById("update").display = 'initial';
        //document.getElementById("update").disabled = false;
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        if (utenteButton || update) {
            utenteButton.style.display = 'none';
            update.disabled = true;
        }

    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        alert("Sei già loggato");
        if (utenteButton || update) {
            utenteButton.style.display = 'none';
            update.disabled = false;
        }
    } else {
        gapi.auth2.getAuthInstance().signIn();
    }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}



window.uploadToYoutube = async function (urlClip, titolo, metadati, descrizioneClip) {
    //Ottieni clip video da URL (hosted cloudinary.com)
    let response = await fetch(urlClip);
    var rawData = await response.blob();
    rawData.type = 'video/mp4';
    console.log("Preparo invio dati a Youtube (API)", rawData);
    uploadRawFile(rawData, titolo, metadati, descrizioneClip);
    return true;
}


async function uploadRawFile(videoclip, titolo, metadatiClip, descrizioneClip) {
    var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    var params = {
        snippet: {
            categoryId: 27,
            title: titolo,
            description: metadatiClip + "%%%" + descrizioneClip,
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

    var okUpload;
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




$("#upload").click(uploadYoutube);



async function uploadYoutube() {
    
var openLocationCode = "da fare";
titolo = document.getElementById("titolo").value;
descrizione = document.getElementById("descrizione").value;
scopo = document.getElementById("scopo").value;
lingua = document.getElementById("lingua").value;
categoria = document.getElementById("categoria").value;
audience = document.getElementById("audience").value;
dettagli = document.getElementById("dettagli").value;


var metadatiClip = openLocationCode + ":" + titolo + ":" + descrizione + ":" + scopo + ":" + lingua + ":" + categoria + ":" + audience + ":" + dettagli;


    var success = await window.uploadToYoutube(audSave.src || recorder.src, titolo, metadatiClip, descrizioneClip);
    if (success) {
        alert("caricato");
    }
}

//  RESPONSIVE HEADER
$('ul.nav li.dropdown').hover(function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(500);
}, function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(500);
});