const url = 'https://mo-node-server.herokuapp.com/api/auth/';
const miFormulario = document.querySelector('form');

//const url = ( window.location.hostname.includes('localhost') )
//            ? 'http://localhost:3000/api/auth/'
//            : 'https://mo-node-server.herokuapp.com/api/auth/'; // TODO: Corregir esta url

function onSignIn(googleUser) {

    //var profile = googleUser.getBasicProfile();
    // console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    // console.log('Name: ' + profile.getName());
    // console.log('Image URL: ' + profile.getImageUrl());
    // console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    var id_token = googleUser.getAuthResponse().id_token;
    const data = { id_token };
    
    fetch( url + 'google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( data )
    })
    .then( resp => resp.json() )
    .then( data => {
        const { token } = data;
        localStorage.setItem('token', token);
        //window.location = 'chat.html';
        document.querySelector('#googleOptions').hidden=false;
    })
    .catch( console.error );

}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        localStorage.setItem('token', '');
        localStorage.setItem('user', '');
        window.location = 'index.html';
    });
}