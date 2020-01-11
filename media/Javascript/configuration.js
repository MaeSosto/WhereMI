/**************LANGUAGE CONFIGURATION*************/

let langs = ['en', 'de', 'it', 'fr', 'es'];
// ON DEFAULT INGLESEE
let lang = 'en';

//SALVO A LOCAL STORAGE L'ULTIMO SELEZIONATO PER MANTENERE LA LINGUA NELLE ALRE PAGINE E ON REFRESH
lang = localStorage.getItem("lang") || 'en';
//SETTO LO STILE CON VALORE DELLA LINGUA SCELTA
setLangStyles(lang);

function setStyles(styles) {
	var elementId = '__lang_styles';
	var element = document.getElementById(elementId);

	if (element) {
		element.remove();
	}
	let style = document.createElement('style');
	style.id = elementId;
	style.type = 'text/css';

	if (style.styleSheet) {
		style.styleSheet.cssText = styles;
	} else {
		style.appendChild(document.createTextNode(styles));
	}
	document.getElementsByTagName('head')[0].appendChild(style);
}

function setLang(lang) {

	setLangStyles(lang);
	localStorage.setItem("lang", lang);

}

function setLangStyles(lang) {
	let styles = langs
		.filter(function (l) {
			return l != lang;

		})
		.map(function (l) {
			return ':lang(' + l + ') { display: none; }';

		})
		.join(' ');

	setStyles(styles);
}


/**************LOADER CONFIGURATION*************/

function onReady(callback) {
	var intervalId = window.setInterval(function() {
	  if (document.getElementsByTagName('body')[0] !== undefined) {
		window.clearInterval(intervalId);
		callback.call(this);
	  }
	}, 1000);
  }
  
  function setVisible(selector, visible) {
	document.querySelector(selector).style.display = visible ? 'block' : 'none';
  }
  
  onReady(function() {
	setVisible('.page', true);
	setVisible('#loading', false);
  });