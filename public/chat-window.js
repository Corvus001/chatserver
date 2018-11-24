// These variables must be declared outside a function in order to become global.
// They are needed in another script (chat.js)
var parentWidth = 0;
var parentHeight = 0;
$(document).ready(function() {
	var chatToggle = 0;
	var faqToggle = 0;
	var demosToggle = 0;

	

	$('#webchat header').on('click', function() {
		if (chatToggle == 0) {
			parent.postMessage("getBig", '*');
			$("#sidebar").show();
			if (parentWidth>360) {
				$('#webchat').animate({width: '365px'}, function() {
					$('#chat-history').css({ height: parentHeight*0.66-140});
					$("#chat-title").append('<span id="text-title">Contacto</span>');
					$("#chat-title").append('<a id="facebook-link-header" class="header-social-img" href="https://www.facebook.com/D43D41U5" target="_blank" rel="noopener noreferrer"><img src="./images/facebook.png" alt="facebook" width="30" height="30"></a>');
					$("#chat-title").append('<a id="twitter-link-header" class="header-social-img" href="https://twitter.com/CrstophrRosales" target="_blank" rel="noopener noreferrer"><img src="./images/twitter.png" alt="twitter" width="30" height="30"></a>');
					$("#chat-title").append('<a id="linkedin-link-header" class="header-social-img" href="https://www.linkedin.com/company/ebdchile" target="_blank" rel="noopener noreferrer"><img src="./images/linkedin.png" alt="linkedin" width="30" height="30"></a>');
					$('.chat').slideToggle(500, 'swing');		
				});
			} else {
				$('#webchat').animate({width: parentWidth+'px', right: '0px', left: '0px'}, function() {
					$('#chat-history').css({ height: parentHeight*0.90-140});
					$("#chat-title").append('<span id="text-title">Asistencia eBD</span>');
					$("#chat-title").append('<a id="facebook-link-header" class="header-social-img" href="https://www.facebook.com/ebdchile/" target="_blank" rel="noopener noreferrer"><img src="./images/facebook.png" alt="facebook" width="30" height="30"></a>');
					$("#chat-title").append('<a id="twitter-link-header" class="header-social-img" href="https://twitter.com/ebdchile" target="_blank" rel="noopener noreferrer"><img src="./images/twitter.png" alt="twitter" width="30" height="30"></a>');
					$("#chat-title").append('<a id="linkedin-link-header" class="header-social-img" href="https://www.linkedin.com/in/cristopher-rosales-4815b7154" target="_blank" rel="noopener noreferrer"><img src="./images/linkedin.png" alt="linkedin" width="30" height="30"></a>');
					$('.chat').slideToggle(500, 'swing');		
				});
			}

			if (parentWidth < 700) {
				$('#btnFaq').hide();
				$('#btnDemo').hide();
			}
			
			chatToggle = 1;

		} else if (chatToggle == 1) {
			$('.div-respuesta').hide();
			$('.div-demo').hide();
			$("#sidebar").hide();
			if (faqToggle == 1) {
				parent.postMessage("closeSidebar", '*');
				$('#webchat').css({left: '30px'});
				$('#preguntas-frecuentes').hide();
				faqToggle = 0;
			}
			if (demosToggle == 1) {
				parent.postMessage("closeSidebar", '*');
				$('#webchat').css({left: '30px'});
				$('#demos').hide();
				demosToggle = 0;
			}
			parent.postMessage("getSmall", '*');
			$('.chat').slideToggle(500, 'swing', function() {		
				$('#text-title').remove();
				$('.header-social-img').remove();
				$('#webchat').animate({width: '100px'});
			});	
			chatToggle = 0;
			
		}
	});

	// ---------------------Listen to height and width of parent------------------------
	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

	eventer(messageEvent, function(e) {
		if ( e.data.name == "width" ) {
			parentWidth = e.data.val;
		}
		else if ( e.data.name == "height" ) {
			parentHeight = e.data.val;
		}
		else {
			console.log("Uncaptured:", e);
		}
	});
	// ----------------------------------------------------------------------------------
	
	$('.btnPregunta').on('click', function() {
		if ($('#div'+this.id).is(':hidden')) {
			$('.div-respuesta').fadeOut({duration: 500});
			$('#div'+this.id).fadeIn({duration: 250});
		}	
	});

	$('.btnAtrasRespuesta').on('click', function() {
		$('.div-respuesta').fadeOut({duration: 250});
	})
	$('#btnFaq').on('click', function() {
		
		if(faqToggle == 0) {
			// Si Demos ya esta abierto
			if (demosToggle == 1) {
				// esconder demos y sus cuerpos
				$('.div-demo').hide();
				$('#demos').hide();
				demosToggle = 0;
				// mostrar faqs
				$('#preguntas-frecuentes').show();
				faqToggle = 1;
			} else { // Si Demos estaba cerrado
				parent.postMessage("openSidebar", '*');
				$('#webchat').css({left: '330px'});
				$('#preguntas-frecuentes').show();
				faqToggle = 1;
			}
		} else if (faqToggle == 1) {
			$('.div-respuesta').hide();

			parent.postMessage("closeSidebar", '*');
			$('#webchat').css({left: '30px'});
			$('#preguntas-frecuentes').hide();
			faqToggle = 0;
		}
	});

	$('#btnDemos').on('click', function() {
		// Abrir Demos
		if(demosToggle == 0) {
			// Si FAQ ya esta abierto
			if (faqToggle == 1) {
				// esconder faq y respuestas
				$('.div-respuesta').hide();
				$('#preguntas-frecuentes').hide();
				faqToggle = 0;
				// mostrar demo
				$('#demos').show();
				demosToggle = 1;	

			} else { // Si Faq estaba cerrado
				parent.postMessage("openSidebar", '*');
				$('#webchat').css({left: '330px'});
				$('#preguntas-frecuentes').hide();
				faqToggle = 0;
				$('#demos').show();
				demosToggle = 1;	
			}
		// Cerrar Demos	
		} else if (demosToggle == 1) {
			parent.postMessage("closeSidebar", '*');
			$('#webchat').css({left:'30px'});
			$('#demos').hide();
			demosToggle = 0;
		}
	});
});
