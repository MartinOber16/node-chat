var url = 'https://mo-node-server.herokuapp.com/api/auth/';

var userClient = null;
var socket = null;

// Referencias HTML
//var txtUid = document.querySelector('#txtUid');
var txtMessage = document.querySelector('#txtMensaje');
var ulUsers = document.querySelector('#divUsuarios');
var ulMessages = document.querySelector('#divChatbox');
var btnSend = document.querySelector('#btnSend');

// Validar el token del localStorage
async function validateJWT() {

    var token = localStorage.getItem('token') || '';

    if(token.length <= 10){
        window.location = 'index.html';
        throw new Error('No hay token');
    }

    try {    
        var myHeaders = new Headers();
        myHeaders.append("token", token);
    
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };
    
        var response = await fetch(url + 'new-token', requestOptions);
        var { status } = response;
        var data = await response.json();

        if(status === 200){
            // Usuario validado
            console.log('Usuario valido!');
            var { user, token: newToken } = data;
            localStorage.setItem('token', newToken);
        
            userClient = user;
            document.title = userClient.name;
        
            await connectSocket();
            
        } else {
            var error = data.error || data.errors[0];    
            console.error(error);
            window.location = "/index.html";
        }

    } catch (error) {
        console.error(error);
    }

}

async function connectSocket() {
    // Inicializo el socket y envio la información del usuario
    socket = io ({
        'extraHeaders': { 
            'user': JSON.stringify(userClient)
        }
    });

    // Conectar el socket 
    socket.on('connect', () => { console.log('Socket online!'); });

    // Desconectar el socket
    socket.on('disconnect', () => { console.log('Socket offline!'); });

    // Escuchar usuarios activos
    socket.on('users-online', renderUsers);

    // Escuchar mensajes publicos
    socket.on('receive-messages', renderMessages);

    // Escuchar mensajes privados
    socket.on('private-message', (payload) => {
        console.log(payload);
    });

}

function renderUsers( users = [] ) {
    console.log('Renderizando usuarios!');
    var usersHtml = '';

    users.forEach( user => {

        if( userClient._id !==  user._id ) {
            usersHtml += `
                <li>
                    <a data-id=${user._id} href="javascript:void( console.log('${user._id}') )"><img src=${user.img} alt="user-img" class="img-circle"> <span>${user.name}<small class="text-success">online</small></span></a>
                </li>
            `;
        }
    })

    ulUsers.innerHTML = usersHtml;
}

function renderMessages( messages = [] ) {
    console.log('Renderizando mensajes!');
    var messagesHtml = '';

    messages.forEach( message => {
        var date = new Date(message.date);
        var hour = date.getHours() + ':' + date.getMinutes();
        
        if( userClient._id ===  message.uid ) {
            messagesHtml += `
                <li class="reverse">
                    <div class="chat-content">
                        <div class="box bg-light-inverse">${message.text}</div>
                    </div>
                    <div class="chat-time">${hour}</div>'
                </li>
            `;

        } else {
            messagesHtml += `
                <li class="animated fadeIn">
                    <div class="chat-content">
                        <h5>${message.name}</h5>
                        <div class="box bg-light">${message.text}</div>
                    </div>
                    <div class="chat-time">${hour}</div>'
                </li>
            `;

        }
    })

    ulMessages.innerHTML = messagesHtml;
    scrollBottom();
}

function scrollBottom() {

    var divChatbox = $('#divChatbox');

    // selectors
    var newMessage = divChatbox.children('li:last-child');

    // heights
    var clientHeight = divChatbox.prop('clientHeight');
    var scrollTop = divChatbox.prop('scrollTop');
    var scrollHeight = divChatbox.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight() || 0;

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        divChatbox.scrollTop(scrollHeight);
    }
}

function sendMessage() {
    var message = txtMessage.value;
    //var uid = txtUid.value;
    var uid = '';

    if(message.length === 0){
        return;
    }

    // Enviar mensaje (si tiene uid entonces es privado)
    socket.emit('send-message', { message, uid });
    console.log('Mensaje enviado!', { uid, message });
    
    txtMessage.value = '';
}

txtMessage.addEventListener('keyup', ({keyCode}) => {
    // keyCode 13 es el ENTER
    if(keyCode !== 13){
        return;
    }

    sendMessage();
})

btnSend.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
})

async function main() {
    // Validar el token del usuario
    await validateJWT();
}

main();
