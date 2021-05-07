const url = 'https://mo-node-server.herokuapp.com/api/auth/';
const miFormulario = document.querySelector('form');

//const url = ( window.location.hostname.includes('localhost') )
//            ? 'http://localhost:3000/api/auth/'
//            : 'https://mo-node-server.herokuapp.com/api/auth/'; // TODO: Corregir esta url

miFormulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {};

    for( let el of miFormulario.elements) {
        if(el.name.length > 0)
            formData[el.name] = el.value;
    }
    
    fetch(url + 'login', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type' : 'application/json' }
    })
    .then( resp => resp.json() )
    .then( data => {
        const { error, token } = data;

        if(error) {
            return console.error(error.msg);
        }

        localStorage.setItem('token', token);
        window.location = 'chat.html';
    })
    .catch( err => {
        console.log(err);
    })

});