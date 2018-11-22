$( document ).ready(function() {
	// ====================RAINBOW INICIALIZATION=========================
	console.log("[DEMO] :: Rainbow Application started!");
    var applicationID = "", 
        applicationSecret = "";
    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");
	var Call = angular.element(document.querySelector('body')).injector().get('Call');
	var Contact = angular.element(document.querySelector('body')).injector().get('Contact');
	var Conversation = angular.element(document.querySelector('body')).injector().get('Conversation');
	
    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log("[DEMO] :: On SDK Ready !");
        // do something when the SDK is ready
    };
	
	var startChat = function(user, pass, contact) {
		// Login With User and Pass
		rainbowSDK.connection.signinOnRainbowOfficial(user, pass);
	}
	// MENSAJE RECIBIDO DESDE RAINBOW
	var onNewMessageReceived = function(event, message, conversation) {
		if (message.data != 'leaveMsgRoom') {
			$(".inbound-message").removeClass('new');
			$(".outbound-message").removeClass('new');
			$(".bot-message").removeClass('new');
			var time = new Date();
			output.innerHTML += '<div class="clearfix new inbound-message">' +
			'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
			'<h5>' + message.from.firstname + ' ' + message.from.lastname + '</h5>' +
			'<p>' + message.data + '</p>' +
			'</div>' + '<hr class="chat-hr">';
			output.scrollTop = output.scrollHeight;
		}
    };
	$(document).on(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived);
	
	var enviar_mensaje = function(mensaje) {
		
		var bubble = rainbowSDK.bubbles.getAllBubbles()[0];
		//console.log(bubble);
		rainbowSDK.im.sendMessageToBubble(bubble, mensaje);
	}
	
	
    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        rainbowSDK.initialize(applicationID, applicationSecret).then(function() {
            console.log("[DEMO] :: Rainbow SDK is initialized!");
        }).catch(function(err) {
            console.log("[DEMO] :: Something went wrong with the SDK...", err);
        });
    };

    /* Listen to the SDK event RAINBOW_ONREADY */
    $(document).on(rainbowSDK.RAINBOW_ONREADY, onReady);

    /* Listen to the SDK event RAINBOW_ONLOADED */
    $(document).on(rainbowSDK.RAINBOW_ONLOADED, onLoaded);

    /* Load the SDK */
    rainbowSDK.load();
	
	// ------------------------ RAINBOW VIDEOCALL ------------------------
	var call_sound = new Audio('./sounds/ring.mp3');
	var onWebRTCCallChanged = function onWebRTCCallChanged(event, call) {
		/* Listen to WebRTC call state change */
		console.log('Cambio Call:', call);

		$('#btnContestar').on('click', function() {
			if (rainbowSDK.webRTC.hasACamera() && rainbowSDK.webRTC.hasAMicrophone()) {
				rainbowSDK.webRTC.answerInVideo(call);	
			} else if (rainbowSDK.webRTC.hasAMicrophone()) {
				rainbowSDK.webRTC.answerInAudio(call);
			} else {
				rainbowSDK.webRTC.release(call);
			}
			call_sound.pause();
			call_sound.currentTime = 0;
			$('#iniciarLlamado').fadeOut(500);
		});
		$('#btnRechazar').on('click', function() {
			rainbowSDK.webRTC.release(call);
		})
		switch(call.status.value) {
			case "incommingCall":
				/* Answer or reject the call */
				$('#iniciarLlamado').show();
				$('#videollamada').fadeIn(500);
				call_sound.play();
				$('#nombreAgente').text(`${call.contact.firstname} ${call.contact.lastname}`)
				//
				break;
			case "active":
				$('#largevideo').show();
				/* display the local and remote video */
				rainbowSDK.webRTC.showLocalVideo();
				rainbowSDK.webRTC.showRemoteVideo(call);
				break;
			case "Unknown":
				call_sound.pause();
				call_sound.currentTime = 0;
				$('#largevideo').hide(),
				$('#videollamada').fadeOut(500);
				/* Hiding the local and remote video */
				rainbowSDK.webRTC.hideLocalVideo();
				rainbowSDK.webRTC.hideRemoteVideo(call);
				break;
			default:
				break;
		}
	}
	$(document).on(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged)

	// ========================== RAINBOW END ============================
	// Aux Variables
	var firstname = "";
	var lastname = "";
	
	// Make connection
//	var socket = io.connect('http://138.197.203.105:4000');
	var socket = io.connect('http://crosales-chatserver.herokuapp.com');

	// Query DOM
	var message = $('#message-input-box');
	var handle = document.getElementById('handle');
	var btn = document.getElementById('send');
	var output = document.getElementById('chat-history');
	var feedback = document.getElementById('feedback');
	var btnChat = document.getElementById('btnAsistencia');
	var nombre = document.getElementById('nombre');
	var apellido = document.getElementById('apellido');
	
	
	
	btnChat.addEventListener('click', function() {
			firstname = nombre.value;
			lastname = apellido.value;
			if (!firstname || !lastname) {
				alert('Debe ingresar nombre y apellido');
			} else {
				socket.emit('login', {
					firstname: firstname,
					lastname: lastname
				});
				$("#start-chat").fadeOut({
					duration: 1000,
					complete: function() {
						$("#chat-started").fadeIn({duration: 1000, complete: function() { 
							if (parentWidth > 700) {
								$('#btnDemos').fadeIn({duration: 1000});
							}
							
						}});
					}
				});
			}
		});
	// Enviar mensaje al presionar enter
	message.on('keydown', function (e) {
		socket.emit('typing', { nombre: firstname, apellido: lastname });
		if (e.key === "Enter" && message.val()) {
			e.preventDefault();
			$(".outbound-message").removeClass('new');
			$(".inbound-message").removeClass('new');
			$(".bot-message").removeClass('new');
			var msj = message.val();
			socket.emit('chat', {
			 	message: msj,
			 	nombre: firstname,
			 	apellido: lastname
            });
            var time = new Date();
			message.val('');
			output.innerHTML += 
			'<div class="clearfix new outbound-message">' + 
            '<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
            '<p style="display: inline;">' + msj + '</p>' + 
			'</div>' + '<hr class="chat-hr">';
			output.scrollTop = output.scrollHeight;
		}
	});
	var ID = function () {
		// Math.random should be unique because of its seeding algorithm.
		// Convert it to base 36 (numbers + letters), and grab the first 9 characters
		// after the decimal.
		return '_' + Math.random().toString(36).substr(2, 9);
	};
	
	var myTimeout;
	
	// MENSAJE RECIBIDO DESDE EL SERVIDOR
	socket.on('chat', function (data) {
		var time = new Date();
		$(".outbound-message").removeClass('new');
		$(".inbound-message").removeClass('new');
		$(".bot-message").removeClass('new');
		var x = ID();
		output.innerHTML += '<div id="'+ x +'">' +
			'<img src="./images/tenor.gif" width="50px" id="' + x + '">' +
			'</div>';
		output.scrollTop = output.scrollHeight;
		setTimeout(function() {
			var div = document.getElementById(x);
			while(div.firstChild) {
				div.removeChild(div.firstChild);
			}
			document.getElementById(x).innerHTML += 
				'<div class="clearfix new bot-message"' + 'id="' + x + '">' +
				'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
				'<p>' + data.message + '</p>' + 
				'</div>' + '<hr class="chat-hr">';
			output.scrollTop = output.scrollHeight;
		}, 3000);
	});
	
	socket.on('preguntar-chat', function(data) {
		setTimeout(function() {
			output.innerHTML += '<div class="clearfix new bot-message" style="text-align:center">' +
							'<p> ¿Quieres chatear con un humano? </p>' +
							'<div><button class="btnsi">Si</button>' + '<button class="btnno">No</button></div>' +
							'</div>' + '<hr class="chat-hr">';
			output.scrollTop = output.scrollHeight;
			// Si el usuario presiona sí
			$(".btnsi").on('click', function() {
				// Mostramos diálogo de conexión en curso.
				output.innerHTML = '<p >Te estamos conectando con uno de nuestros agentes...</p>' +
					'<img style="display:block; margin:auto;"src="./images/giphy.gif">';
				// Solicitamos credenciales para Rainbow al servidor
				socket.emit('rainbow_login', {firstname: firstname, lastname: lastname} );
				// Cuando el servidor nos retorna las credenciales.
				socket.on('succesful_login', function(data) {
					// Iniciamos Sesión
					startChat(data.user, data.pass);
					// Quitamos el anterior event listener para el enter (No queremos emitir un evento 'chat' por el socket anymore)
					message.off('keydown');
					// Agregamos un nuevo event listener que manda el mensaje a Rainbow cuando presionamos enter.
					message.on('keydown', function (e) {
						socket.emit('typing', { nombre: firstname, apellido: lastname });
						if (e.key === "Enter" && message.val()) {
							e.preventDefault();
							$(".outbound-message").removeClass('new');
							$(".inbound-message").removeClass('new');
							$(".bot-message").removeClass('new');
							var msj = message.val();
							enviar_mensaje(message.val());
							var time = new Date();
							message.val('');
							output.innerHTML += 
							'<div class="clearfix new outbound-message">' + 
							'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
							'<p style="display: inline;">' + msj + '</p>' + 
							'</div>' + '<hr class="chat-hr">';
							output.scrollTop = output.scrollHeight;
						}
					});
					output.innerHTML = '<p style="text-align:center;font-color:#aaa">Te hemos conectado con nuestros agentes. En brevés momentos nos pondremos en contacto con usted!</p>';
				});

			})
			$(".btnno").on('click', function() {
				var time = new Date();
				$(".outbound-message").removeClass('new');
				$(".inbound-message").removeClass('new');
				$(".bot-message").removeClass('new');
				output.innerHTML += 
				'<div class="clearfix new bot-message">' +
				'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
				'<p>' + 'Ok! Sin Humanos!' + '</p>' + 
				'</div>' + '<hr class="chat-hr">';
				output.scrollTop = output.scrollHeight;
			});
		}, 3000);
		
	});
	

	socket.on('typing', function (data) {
		clearTimeout(myTimeout);
		feedback.innerHTML = '<p><em>' + data + ' está escribiendo...</em></p>';
		myTimeout = setTimeout(function() {
			feedback.innerHTML = "";
		}, 3000);
	});

	// CALLBACK
	var numeroRegistrado = 0;
	$('#btncallback').on('click', function() {
		if (numeroRegistrado == 1) {
			alert("Ya registramos tus datos");
			return;
		}
		var time = new Date();
		$(".outbound-message").removeClass('new');
		$(".inbound-message").removeClass('new');
		$(".bot-message").removeClass('new');
		message.val('');
		output.innerHTML += 
		'<div class="clearfix new outbound-message">' + 
		'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
		'<p style="display: inline;">' + 'Llámenme!' + '</p>' + 
		'</div>' + '<hr class="chat-hr">';
		output.scrollTop = output.scrollHeight;
		socket.emit('chat', {
			message: 'Llámenme!',
			nombre: firstname,
			apellido: lastname
	   });
	});
	
	socket.on('callback', function() {
		output.innerHTML +=
		'<div class="clearfix new bot-message" id="formulario-callback" style="width:90%;border: 1px solid #000">' +
		'<div style="display:block">' + 'RUT*<input id="rut" type="text" style="position: relative; left: 109px">'+'</input>' + '</div>' +
		'<div style="display:block">' + 'Teléfono*' + '<input id="numero" type="text" style="position: relative; left: 80px"></input>' + '</div>' +
		'<button id="enviarcallback">Enviar</button>' +
		'</div>';
		$('#enviarcallback').on('click', function() {
			rut = $('#rut').val();
			numero = $('#numero').val();
			if(/\D/.test(numero) || numero.length != 9) {
				alert('Debe ingresar un número de 9 dígitos');
				return;
			}
			if (!Rut(rut)) {
				return;
			}
			$('#formulario-callback').remove();
			socket.emit('solicitud-callback', { nombre: firstname, apellido: lastname, rut: rut, numero: numero});
			var time = new Date();
			$(".outbound-message").removeClass('new');
			$(".inbound-message").removeClass('new');
			$(".bot-message").removeClass('new');
			output.innerHTML += 
			'<div class="clearfix new inbound-message">' + 
			'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
			'<p style="display: inline;">' + 'Hemos registrado, tus datos. Nuestros agentes se pondrán en contacto contigo a la brevedad!' + '</p>' + 
			'</div>' + '<hr class="chat-hr">';
			output.scrollTop = output.scrollHeight;
			numeroRegistrado=1;
		});
		
	});


	$("#btnclima").on('click', function() {
		var time = new Date();
		$(".outbound-message").removeClass('new');
		$(".inbound-message").removeClass('new');
		$(".bot-message").removeClass('new');
		message.val('');
		output.innerHTML += 
		'<div class="clearfix new outbound-message">' + 
		'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
		'<p style="display: inline;">' + '¿Puedes darme el pronóstico climático?' + '</p>' + 
		'</div>' + '<hr class="chat-hr">';
		output.scrollTop = output.scrollHeight;
		socket.emit('chat', {
			message: '¿Puedes darme el pronóstico climático?',
			nombre: firstname,
			apellido: lastname
	   });
	});
	$("#btnindicadores").on('click', function() {
		var time = new Date();
		$(".outbound-message").removeClass('new');
		$(".inbound-message").removeClass('new');
		$(".bot-message").removeClass('new');
		message.val('');
		output.innerHTML += 
		'<div class="clearfix new outbound-message">' + 
		'<span class="chat-time">' + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2) + '</span>' +
		'<p style="display: inline;">' + 'Indicadores Económicos' + '</p>' + 
		'</div>' + '<hr class="chat-hr">';
		output.scrollTop = output.scrollHeight;
		socket.emit('chat', {
			message: 'Indicadores Económicos',
			nombre: firstname,
			apellido: lastname
	   });
	});
	
});

