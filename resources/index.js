$(function() {
	// Deck initialization
	$.deck('.slide', {
	  showdown: {
	    debug: true,
	    slideSelector: '.markdown'
	  }
	});
	
	$("pre.js").snippet("javascript", {style:"whitengrey", showNum: true});
	$("pre.php").snippet("php", {style:"whitengrey", showNum: true});
});