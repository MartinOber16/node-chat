const { io } = require('../app');
const ChatMessages = require('../models/chat-messages');

const chatMessages = new ChatMessages();

io.on('connection', ( client ) => {

    const user = client.handshake.headers['user'];    
    // Si el usuario no existe desconecto al cliente
    if( !user ) {
        return client.disconnect();
    }

    // Agregar el usuario conectado al chat
    const userClient = JSON.parse(user);
    chatMessages.connectUser( userClient ); 
    console.log(`Se conecto ${userClient.name}`);

    // Enviar mensaje para todos con los usuarios conectados
    io.emit('users-online', chatMessages.usersArr);

    // Enviar los mensajes al usuario conectado
    client.emit('receive-messages', chatMessages.getAll );

    // Conectar al usuario a una sala especial para mensajes privados
    client.join( userClient._id ); // sala global (io), sala de conexión (client.id) y sala de usuario (usuario.id)

    // Limpiar cuando alguien se desconecta
    client.on('disconnect', () => {
        chatMessages.disconnectUser(userClient._id);
        console.log(`Se desconecto ${userClient.name}`);

        io.emit('users-online', chatMessages.usersArr);
    });

    // Escuchar mensajes del cliente
    client.on('send-message', (payload) => {

        console.log('Mensaje: ', payload);
        const { uid, message } = payload;

        if( uid ){
            // Enviar mensaje privado
            client.to( uid ).emit('private-message', { name: userClient.name, message })
            
        } else {
            // Enviar mensaje publico
            chatMessages.sendMessage( userClient._id, userClient.name, message );
            io.emit('receive-messages', chatMessages.getAll );
        }
    })

} );


