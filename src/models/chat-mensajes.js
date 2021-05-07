class Mensaje {

    constructor(uid, nombre, mensaje) {
        this.uid = uid,
        this.nombre = nombre,
        this.mensaje = mensaje,
        this.fecha = new Date()
    }

}

class ChatMensajes {

    constructor() {
        this.mensajes = [];
        this.usuarios = {};
    }

    get ultimos10() {
        this.mensajes = this.mensajes.splice(0,10);
        return this.mensajes;   
    }

    get todos() {
        return this.mensajes;   
    }

    get usuariosArr() {
        return Object.values( this.usuarios );
    }
    
    enviarMensaje( uid, nombre, mensaje ) {
        //this.mensajes.unshift(
        this.mensajes.push(
            new Mensaje(uid, nombre, mensaje, null)
        );
    }

    conectarUsuario( usuario ) {
        this.usuarios[usuario._id] = usuario;
    }

    desconectarUsuario( id ) {
        delete this.usuarios[id];
    }

}

module.exports = ChatMensajes;