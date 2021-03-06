class Message {

    constructor(uid, name, text) {
        this.uid = uid,
        this.name = name,
        this.text = text,
        this.date = new Date()
    }

}

class ChatMessage {

    constructor() {
        this.messages = [];
        this.users = {};
    }

    get getLastTen() {
        this.messages = this.messages.splice(0,10);
        return this.messages;   
    }

    get getAll() {
        return this.messages;   
    }

    get usersArr() {
        return Object.values( this.users );
    }
    
    sendMessage( uid, name, text ) {
        //this.mensajes.unshift(
        this.messages.push(
            new Message(uid, name, text)
        );
        
        // Elimino el primer mensaje para que no se me vaya de los 100 elementos
        if(this.messages.length > 100)
            this.messages.shift();

    }

    connectUser( user ) {
        this.users[user._id] = user;
    }

    disconnectUser( id ) {
        delete this.users[id];
    }

}

module.exports = ChatMessage;