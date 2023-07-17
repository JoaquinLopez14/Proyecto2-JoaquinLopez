const dotenv = require("dotenv");
      dotenv.config();     // Carga las variables de entorno del archivo .env

const { MongoClient } = require ('mongodb');

const URI = process.env.MONGODB_URLSTRING;      // Obtiene la URL de conexión a MongoDB desde las variables de entorno
const client = new MongoClient(URI);       // Crea una instancia del cliente de MongoDB

const conectarAMongoDB = async () =>{
    try {
        await client.connect();     // Conecta al cliente de MongoDB al servidor
        console.log('Conectado con exito a MongoDB');
    return client;      // Retorna el cliente conectado
   }catch (error) {
        console.error('Error al conectarse a MongoDB', error);
    return null;        // Retorna null en caso de error
   }
};

const desconectarDeMongoDB = async () => {
    try {
        await client.close();       // Cierra la conexión con el servidor de MongoDB
        console.log('Desconectado De MongoDB');
   }catch (error) {
        console.error('Error al desconectarse de MongoDB', error);
    return null;
   }
};

module.exports = { conectarAMongoDB, desconectarDeMongoDB };    //Exporta las funciones para usarse en otros archivos