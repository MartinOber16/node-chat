const { io } = require('../app');
const ChatMensajes = require('../models/chat-mensajes');

const chatMensajes = new ChatMensajes();

io.on('connection', (client) => {

    const user = client.handshake.headers['user'];    
    // Si el usuario no existe desconecto al cliente
    if( !user ) {
        return client.disconnect();
    }

    // Agregar el usuario conectado al chat
    const usuario = JSON.parse(user);
    chatMensajes.conectarUsuario( usuario ); 
    console.log(`Se conecto ${usuario.name}`);

    // Enviar mensaje para todos con los usuarios conectados
    io.emit('usuarios-activos', chatMensajes.usuariosArr);

    // Enviar los ultimos 10 mensajes al usuario conectado
    client.emit('recibir-mensajes', chatMensajes.ultimos10 );

    // Conectar al usuario a una sala especial para mensajes privados
    client.join( usuario._id ); // sala global (io), sala de conexión (client.id) y sala de usuario (usuario.id)

    // Limpiar cuando alguien se desconecta
    client.on('disconnect', () => {
        console.log(`Se desconecto ${usuario.name}`);
        chatMensajes.desconectarUsuario(usuario._id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr);
    });

    // Escuchar mensajes del cliente
    client.on('enviar-mensaje', (payload) => {

        const { uid, mensaje } = payload;

        if( uid ){
            // Enviar mensaje privado
            client.to( uid ).emit('mensaje-privado', {nombre: usuario.name, mensaje })

        } else {
            // Enviar mensaje publico
            chatMensajes.enviarMensaje(usuario._id, usuario.name, mensaje);
            io.emit('recibir-mensajes', chatMensajes.ultimos10 );

        }
    })

} );


