require('dotenv').config();

// PUERTO
const port = process.env.PORT;

// ENTORNO
const nodeEnv = process.env.NODE_ENV;

// SERVIDOR API REST
const urlApi = process.env.API_SERVER;

module.exports = {
    port,
    nodeEnv,
    urlApi,
}