const { io } = require('../app');
const { ChatMensajes } = require('../models');

const chatMensajes = new ChatMensajes();

io.on('connection', (client) => {
    //console.log( client.handshake.headers['user'] );
    let usuario = client.handshake.headers['user'];
    
    // Si el usuario no existe desconecto al cliente
    if( !usuario ) {
        return client.disconnect();
    }

    // Agregar el usuario conectado
    usuario = JSON.parse(usuario);
    console.log(`Se conecto ${usuario.name}`);
    chatMensajes.conectarUsuario(usuario); 

    // Enviar mensaje para todos con los usuarios activos
    io.emit('usuarios-activos', chatMensajes.usuariosArr);

    // Enviar mensaje al cliente con los ultimos 10 mensajes
    client.emit('recibir-mensajes', chatMensajes.ultimos10 );

    // Conectarlo a una sala especial para mensajes privados
    client.join( usuario._id ); // sala global, socket.id y ahora usuario.id

    // Limpiar cuando alguien se desconecta
    client.on('disconnect', () => {
        console.log(`Se desconecto ${usuario.name}`);
        chatMensajes.desconectarUsuario(usuario._id);
        io.emit('usuarios-activos', chatMensajes.usuariosArr)
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


