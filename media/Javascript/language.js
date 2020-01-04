let langs = ['en', 'de', 'it', 'fr', 'es'];
let lang = 'en';

setLangStyles(lang);

function setStyles(styles) {
	var elementId = '__lang_styles';
	var element = document.getElementById(elementId);
	if (element) {
		element.remove();
	}
	// console.log(lang)
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
	console.log(lang)
}
