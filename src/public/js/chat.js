const url = 'https://mo-node-server.herokuapp.com/api/auth/';

let usuario = null;
let socket = null;

// Referencias HTML
//const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
//const ulUsuarios = document.querySelector('#ulUsuarios');
const ulUsuarios = document.querySelector('#divUsuarios');
//const ulMensajes = document.querySelector('#ulMensajes');
const ulMensajes = document.querySelector('#divChatbox');
//const btnSalir = document.querySelector('#btnSalir');

// Validar el token del localStorage
const validarJWT = async() => {

    const token = localStorage.getItem('token') || '';

    if(token.length <= 10){
        window.location = 'index.html';
        throw new Error('No hay token');
    }

    try {    
        let myHeaders = new Headers();
        myHeaders.append("token", token);
    
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };
    
        const response = await fetch(url + 'new-token', requestOptions);
        const { status } = response;
        const data = await response.json();

        if(status === 200){
            // Usuario validado
            const { user, token: newToken } = data;
            localStorage.setItem('token', newToken);
        
            usuario = user;
            document.title = user.name;
        
            await conectarSocket();
            
        } else {
            const error = data.error || data.errors[0];    
            console.error(error);
            window.location = "/index.html";
        }

    } catch (error) {
        console.error(error);
    }

}

const conectarSocket = async () => {
    // Inicializo el socket y envio la información del usuario
    socket = io ({
        'extraHeaders': { 
            'user': JSON.stringify(usuario)
        }
    });

    // Conectar el socket 
    socket.on('connect', () => { console.log('Socket online'); });

    // Desconectar el socket
    socket.on('disconnect', () => { console.log('Socket offline'); });

    // Escuchar mensajes publicos
    socket.on('recibir-mensajes', dibujarMensajes);

    // Escuchar usuarios activos
    socket.on('usuarios-activos', dibujarUsuarios);

    // Escuchar mensajes privados
    socket.on('mensaje-privado', (payload) => {
        console.log(payload);
    });

}

const dibujarUsuarios = ( usuarios = [] ) => {
    let usersHtml = '';

    usuarios.forEach( user => {
        usersHtml += `
            <li>
                <a data-id=${user._id} href="javascript:void(0)"><img src=${user.img} alt="user-img" class="img-circle"> <span>${user.name}<small class="text-success">online</small></span></a>
            </li>
        `;

    })

    ulUsuarios.innerHTML = usersHtml;
}

const dibujarMensajes = ( mensajes = [] ) => {
    let mensajesHtml = '';

    mensajes.forEach( mensaje => {
        var fecha = new Date(mensaje.fecha);
        var hora = fecha.getHours() + ':' + fecha.getMinutes();
        
        if( usuario._id ===  mensaje.uid ) {
            mensajesHtml += `
                <li class="reverse">
                    <div class="chat-content">
                        <h5>${mensaje.nombre}</h5>
                        <div class="box bg-light-inverse">${mensaje.mensaje}</div>
                    </div>
                    <div class="chat-time">${hora}</div>'
                </li>
            `;

        } else {
            mensajesHtml += `
                <li class="animated fadeIn">
                    <div class="chat-content">
                        <h5>${mensaje.nombre}</h5>
                        <div class="box bg-light">${mensaje.mensaje}</div>
                    </div>
                    <div class="chat-time">${hora}</div>'
                </li>
            `;

        }
    })

    ulMensajes.innerHTML = mensajesHtml;
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

txtMensaje.addEventListener('keyup', ({keyCode}) => {

    const mensaje = txtMensaje.value;
    //const uid = txtUid.value;
    const uid = '';

    // keyCode 13 es el ENTER
    if(keyCode !== 13){
        return;
    }

    if(mensaje.length === 0){
        return;
    }

    // Enviar mensaje (si tiene uid entonces es privado)
    socket.emit('enviar-mensaje', { mensaje , uid });
    
    txtMensaje.value = '';

})

const main = async() => {
    // Validar el token del usuario
    await validarJWT();

}

main();
