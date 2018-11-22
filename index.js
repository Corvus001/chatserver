// Load modules
const https = require('https');                         // HTTPS SERVER
const http = require('http');                           // HTTP SERVER
const fs = require('fs');                               // NECESSARY TO READ SSL CERTIFICATE FROM FILESYSTEM
const express = require('express');                     // MODULE TO BOOTSTRAP HTTP SERVERS
const socket = require('socket.io');                    // ESTABLISH COMMUNICATION BETWEEN SERVER AND CLIENT THROUGH SOCKET
const cors = require('cors');                           // ENABLE CROSS DOMAIN CONTENT LOADING
const mongoose = require('mongoose');                   // MONGOOSE IS A MODULE TO CONNECT TO A MONGODB DATABASE
const RainbowSDK = require('rainbow-node-sdk');         // RAINBOW NODE SDK
const projectId = 'ebdagente-34b08';                    // DIALOGFLOW PROJECT ID FOR CHATBOT AGENT
const sessionId = 'quickstart-session-id';              // THIS IS A FIXED VALUE
const query = "Como estás?"                             // VARIABLE AUXILIAR
const languageCode = 'es-ES';
const PORT = process.env.PORT || 5000;
// =============================== GOOGLE DIALOGFLOW ===========================================
// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// The text query request.
let request = {
    session: sessionPath,
    queryInput: {
        text: {
            text: query,
            languageCode: languageCode
        }
    }
};

// ============================== END GOOGLE DIALOGFLOW ========================================

// =============================== Conectarse a MongoDB =========================================
// mongoose.connect('mongodb://localhost:27017/chatEbd', { useNewUrlParser: true })
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => {throw err});
// // MONGOOSE SCHEMA - DEFINES STRUCTURE OF DOCUMENT IN MONGODB
// const preguntaSchema = new mongoose.Schema({
//     pregunta: String,
//     tipo: String,
//     respuesta: String,
//     isPublished: Boolean
// });
// const solicitudesSchema = new mongoose.Schema({
//     nombre: String,
//     apellido: String,
//     rut: String,
//     numero: String,
//     fecha: Date,
//     pendiente: Boolean,
//     ultLlamada: String,
//     intentos: Number,
//     archivada: Boolean,
// });
// const mensajeSchema = new mongoose.Schema({
//     from: String,
//     date: Date,
//     content: String
// });
// const registrosSchema = new mongoose.Schema({
//     nombre: String,
//     fecha: Date,
//     botConversation: [mensajeSchema],
//     agentConversation: [mensajeSchema]
// });

// const Pregunta = mongoose.model('Pregunta', preguntaSchema); // returns a class
// const Solicitud = mongoose.model('solicitudes', solicitudesSchema);
// const Registro = mongoose.model('Registros', registrosSchema);

// // Schema => Model => Class => Object
// async function getPreguntas() {
//     return preguntas = await Pregunta
//         .find({ isPublished: true});
// }
// =============================== Instancear Rainbow SDK =======================================
const options = {
    "rainbow": {
        "host": "official"
    },
    "credentials": {
        "login": "cristopher.rosales@ebd.cl",
        "password": "Ebd.cl2018"
    },
    //  "application": {
    //      "appID": "31da8390839511e8aa2f2b64af878e0b",
    //      "appSecret": "u5983X234GEPrt1cNu1CVtrWc2DjUBTJPjrL4th93iikspMk9OeztnBWU9LweJed"
    // },
    "logs": {
        "enableConsoleLogs": false,
        "enableFileLogs": false,
        "file": {
            "path": "/var/tmp/rainbowsdk",
            "level": "debug"
        }
    },
    // IM options
    "im" : {
        "sendReadReceipt": true
    }
};
const rainbowSDK = new RainbowSDK(options);

// Start Rainbow SDK
rainbowSDK.start();

// Listen to Events
rainbowSDK.events.on('rainbow_onready', function() {
    console.log('Rainbow connected and ready.');
});

// ================================ End Rainbow Initialization =====================================

// ========== SERVER ============
// Express app Setup
const express_options = {
    key: fs.readFileSync("./ssl/express-selfsigned.key"),
    cert: fs.readFileSync("./ssl/express-selfsigned.crt")
}
const app = express();
app.set('view engine', 'pug')
app.use(cors());
app.get('/', function(req, res) {
    // getPreguntas().then((preguntasFromMongoDB) => {
    //     res.render('index.pug', { preguntas: preguntasFromMongoDB })
    // });
    res.render('index.pug', { preguntas: [] })
});
app.use(express.static('public'));

const http_server = http.createServer(express_options, app).listen(PORT);
// const https_server = https.createServer(express_options, app).listen(4040);

// Socket Setup
const io = socket(http_server);

// ========== END SERVER ==========
var agente1 = '5b48f641d82e7650f1d3a48e' // pruebas.chat.ebd.1@gmail.com
var agente2 = '5b51000015eb3d085a1a643f' // pruebas.chat.ebd.2@gmail.com
var array_agentes = [agente1, agente2];

io.on('connect', function(socket) {
    console.log('Nuevo Socket abierto. Id:', socket.id);
    var created_bubble;
    var chat;
    // Login
    socket.on('login', function(data) {
        socket.emit('chat', { name: 'eBD', message:'Gracias por ponerse en contacto con nosotros. Cuéntanos en qué te podemos ayudar! También puedes clickear las pestañas del lado y revisar nuestras preguntas frecuentes.'});        
        chat = {
            name: 'Chat de ' + data.firstname + ' ' + data.lastname,
            date: new Date(),
            botConversation: [],
            addBotMessage: function(message, name) {
                var message_object = {
                    from: String(name),
                    date: new Date(),
                    content: String(message)
                }
                this.botConversation.push(message_object);
            },
            agentConversation: [],
            addAgentMessage: function(message, name) {
                var message_object = {
                    from: String(name),
                    date: new Date(),
                    content: String(message)
                }
                this.agentConversation.push(message_object);
            }
        }
    });
    // Chat
    var saludos = ['Hola', 'Hola!', 'Buenos días!', 'buen día!', 'alo?', 'Buenos días', 'buen día', 'buenas tardes', 'buenas noches', 'que tal', 'alo', 'buenas', 'qué tal', 'buenas!', 'buenas tardes!', '¡Buen día!', '¡Buenos días!', 'Buena tarde'];
    var holas = ['Hola!', 'Buen día!', 'Qué tal, cuéntame tu problema!', 'Muy buen día!', 'Bienvenido, dime cómo te ayudo!', 'Bienvenido a eBD, dime qué necesitas!'];
    var defaults = ['Ups, lo siento. Por ahora solo sé saludar :( Usa los botones de DEMO!', 'Aún no entiendo muy bien a los humanos.  Intenta con los mensajes predefinidos.'];
    var fallo = 0;
    socket.on('chat', function(data) {
        chat.addBotMessage(data.message, data.nombre +' '+data.apellido);
        // DETECT INTENT DIALOGFLOW
        request.queryInput.text.text = data.message;
        sessionClient.detectIntent(request)
            .then(responses => {
                // console.log('Detected intent');
                const result = responses[0].queryResult;
                // console.log(`   Query: ${result.queryText}`);
                // console.log(`   Response: ${result.fulfillmentText}`);
                if (result.intent) {
                    // console.log(`   Intent: ${result.intent.displayName}`);
                    // CONTACTO
                    if (result.intent.displayName === 'razon-de-contacto-SOPORTE - yes' || result.intent.displayName === 'razon-de-contacto-COMERCIAL - yes' || result.intent.displayName === 'razon-de-contacto-OTRO - yes') {
                        socket.emit('preguntar-chat');
                        chat.addBotMessage('preguntar-chat', 'Bot')
                        return;
                    }
                    // LLAMENME
                    else if (result.intent.displayName === 'llamenme') {
                        socket.emit('chat', { name: 'eBD', message: 'Ingresa tus datos en el formulario.' });
                        chat.addBotMessage('Ingresa tus datos en el formulario.', 'Bot');
                        socket.emit('callback');
                        return;
                    }
                    // CLIMA
                    else if (result.intent.displayName === 'clima') {
                        socket.emit('chat', {name: 'eBD', message:'Claro! Déjame consultar la API de openweathermap.org'})
                        chat.addBotMessage('Claro! Déjame consultar la API de openweathermap.org', 'Bot');
                        http.get('http://api.openweathermap.org/data/2.5/weather?id=3875139&APPID=67b991abfad6c8c294fcf55bb35a2135&lang=es&units=metric', (res) => {
                            let data = '';
                            res.on('data', (chunk) => {
                                data += chunk;
                            });
                            res.on('end', () => {
                                //console.log(data);
                                socket.emit('chat', { name: 'eBD', message:`Actualmente hay ${JSON.parse(data).main.temp} grados en Providencia, hay un poco de ${JSON.parse(data).weather[0].description}. La humedad es de un ${JSON.parse(data).main.humidity}%.`})
                                chat.addBotMessage(`Actualmente hay ${JSON.parse(data).main.temp} grados en Providencia, hay un poco de ${JSON.parse(data).weather[0].description}. La humedad es de un ${JSON.parse(data).main.humidity}%.`, 'Bot');
                            });
                        });
                        return;
                    }
                    // INDICADORES
                    else if (result.intent.displayName === 'indicadores') {
                        socket.emit('chat', {name: 'eBD', message:'Claro! Déjame consultar la API de mindicador.cl'})
                        chat.addBotMessage('Claro! Déjame consultar la API de mindicador.cl', 'Bot');
                        https.get('https://mindicador.cl/api', (res) => {
                            let data = '';
                            res.on('data', (chunk) => {
                                data += chunk;
                            });
                            res.on('end', () => {
                                //console.log(data);
                                socket.emit('chat', { name: 'eBD', message:`Fecha: ${String(JSON.parse(data).fecha).substring(0, String(JSON.parse(data).fecha).indexOf("T"))}`});
                                socket.emit('chat', { name: 'eBD', message:`Valor UF: $ ${JSON.parse(data).uf.valor}.`});
                                socket.emit('chat', { name: 'eBD', message:`Valor Dólar Observado: $ ${JSON.parse(data).dolar.valor}`});
                                socket.emit('chat', { name: 'eBD', message:`Valor UTM: $ ${JSON.parse(data).utm.valor}`});
                            });
                        });
                        return;
                    }
                    // Emitir Respuesta desde Dialogflow
                    else {
                        socket.emit('chat', { name: 'eBD', message: result.fulfillmentText });
                        chat.addBotMessage(result.fulfillmentText, 'Bot');
                        return;
                    }
                } else {
                    console.log(`   No intent matched.`);
                }
            })
            .catch(err => {
                console.log('Error', err);
            });
    });
    // Hablar con Agente
    socket.on('rainbow_login', function(data) {
        var chatContestado = 0; // Variable auxiliar. Previene intentar eliminar agentes de la bubuja una vez que ya se ha hecho una vez.
        console.log('Usuario', data.firstname, data.lastname, 'iniciando sesión.');
        rainbowSDK.admin.createGuestUser(data.firstname, data.lastname, 'es-CL', 600).then((guest) => {
            console.log('Usuario invitado de Rainbow creado.');
            console.log('Usuario:', guest.loginEmail);
            console.log('Password:', guest.password);
            socket.emit('succesful_login', { user: guest.loginEmail, pass: guest.password});
            rainbowSDK.bubbles.createBubble(`Chat de ${data.firstname} ${data.lastname}`, ".", false).then(function(bubble) {
                created_bubble = bubble;
                let sendAnInvite = false;
                let invitedAsModerator = false;
                rainbowSDK.bubbles.inviteContactToBubble(guest, bubble, invitedAsModerator, sendAnInvite, ".").then();
                // Invitar a pruebas.chat.ebd.1@gmail.com
                rainbowSDK.contacts.getContactById('5b48f641d82e7650f1d3a48e').then((contact) => {
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, invitedAsModerator, sendAnInvite, ".").then();
                });
                // Invitar a pruebas.chat.ebd.2@gmail.com
                rainbowSDK.contacts.getContactById('5b51000015eb3d085a1a643f').then((contact) => {
                    rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, invitedAsModerator, sendAnInvite, ".").then();
                });
                // Invitar Ramon Salas Z.
                // rainbowSDK.contacts.getContactById(rsalasz).then((contact) => {
                //     rainbowSDK.bubbles.inviteContactToBubble(contact, bubble, invitedAsModerator, sendAnInvite, ".").then();
                // });
            });

            // MANEJAR DISTRIBUCION DE INTERACCIONES
            rainbowSDK.events.on('rainbow_onmessagereceived', (message) => {
                rainbowSDK.contacts.getContactByJid(message.fromBubbleUserJid.substring(0, message.fromBubbleUserJid.indexOf('/'))).then((contact) => {
                    chat.addAgentMessage(message.content, contact.firstName + ' ' + contact.lastName);
                });
                
                if (chatContestado==0) {
                    // Al recibir un mensaje, checkeo que no venga de un bot.
                    if(!message.fromJid.includes(rainbowSDK.connectedUser.jid_im)) {
                        // Si el tipo de mensaje es groupchat, viene de una burbuja.
                        if (message.type === 'groupchat') {
                            // Busco el contacto que me mandó el mensaje.
                            rainbowSDK.contacts.getContactByJid(message.fromBubbleUserJid.substring(0, message.fromBubbleUserJid.indexOf('/'))).then((contact) => {
                                // Si el rol del contacto es guest, entonces es el usuario temporal que cree.
                                if (contact.roles != 'guest') {
                                    // Por cada uno de los agentes que tengo en mi piscina (que contestan chats)
                                    for (var i=0; i<array_agentes.length; i++) {
                                        // Si el agente que estoy mirando no es el que mandó el mensaje
                                        if (array_agentes[i] != contact.id) {
                                            // Lo elimino de la burbuja
                                            rainbowSDK.contacts.getContactById(array_agentes[i]).then((contactToDelete) => {
                                                rainbowSDK.bubbles.removeContactFromBubble(contactToDelete, message.conversation.bubble).then((updatedBubble) => {
                                                    console.log('Deleted contact', contactToDelete.firstName, contactToDelete.lastName);
                                                });
                                            })   
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            });
        });
    });    
    // ================ SOCKET EVENTS =================
    
    // Disconect
    socket.on('disconnect', function() {
        console.log('Disconnected', socket.id);
        // Si se ha creado una burbuja, envía un mensaje a la burbuja diciendo que el usuario abandonó.
        console.log(chat);
        var registro = new Registro( { nombre: chat.name, fecha: chat.date, botConversation: chat.botConversation, agentConversation: chat.agentConversation });
        registro.save();
        if (created_bubble) {
            rainbowSDK.im.sendMessageToBubble('El cliente ha abandonado la sesión', created_bubble);
            rainbowSDK.bubbles.setBubbleName(created_bubble, 'CERRADO-' +created_bubble.name);
        }
        
    });
    // Solicitud Callback
    socket.on('solicitud-callback', function(data) {
       var solicitud = new Solicitud({ nombre: data.nombre, apellido: data.apellido, rut: data.rut, numero: data.numero, fecha: new Date(), pendiente: true, ultLlamada: '-', intentos: 0, archivada: false });
       solicitud.save(); 
    });

});
