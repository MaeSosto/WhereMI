//const API_KEY = "AIzaSyARgIB-2zTsZcy7IoYDUWlXu0a7yQDOj9s";
//const CLIENT_ID = "840091091157-fitfqdv3e84ivdh1fj0on6s1ganlu1eo.apps.googleusercontent.com";

/* work online
const API_KEY = "AIzaSyBcTEce_U3Ho-Ua4SiUmOvo0tPDzWkuBd4";
const CLIENT_ID = "899661843536-gl9bsjpnqbjkcddj1e8167o6e6anpmrd.apps.googleusercontent.com";
 */


// TODO localhost JOPROVE keys to delete in the end 
// const API_KEY = "AIzaSyD-mpMmNo1CDOd8fAF7exQ_g4GInG882FM";
// const CLIENT_ID = "899376088276-hufn1h9oj01vc5u9ui9ithdku5iln5rg.apps.googleusercontent.com";


//CODICI funzionanti per upload YT + backup per esaurimento quote (error 403 - youtube.quota)


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
var userStatus = document.getElementById('userStatus')
var update = document.getElementById('update');

/*function f() {
  alert("fai login");

}*/
/**
 *  On load, called to load the auth2 library and API client library.
 */
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
		userStatus.style.display = 'block';

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
		userStatus.style.display = 'none';
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