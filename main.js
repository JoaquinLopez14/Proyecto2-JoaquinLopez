const express = require ("express");
const  { conectarAMongoDB, desconectarDeMongoDB } = require('./src/mongodb.js');  //Importa las funciones del archivo "mongodb.js"
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req,res,next)=>{
    res.header('Content-Type','application/json; charset=utf-8');
    next();
});

// Ruta de inicio
app.get('/', ( req, res) => {
    res.status(200).end('¡Bienvenidos a la API del Market!');
});

// Ruta para obtener todos los productos
app.get('/market', async (req,res)=>{
    try {
// Conexión a la base de datos
    const client = await conectarAMongoDB();
    if (!client) {
        res.status(500).send('Error al conectarse a MongoDB');
        return;
        }
// Obtener todos los productos y convertirlos en un Array
    const db = client.db("market");
    const market = await db.collection("market").find().toArray();
    res.json(market);
    }catch (error){
        res.status(500).send('Error al obtener productos del market');    // Manejo de errores al obtener los productos
    }finally {
        await desconectarDeMongoDB();     // Desconexión de la base de datos
    }
});

// Ruta para obtener un producto por su Codigo
app.get('/market/:codigo', async (req, res)=>{
    const marketCodigo = parseInt(req.params.codigo);
    try {
// Conexión a la base de datos
        const client = await conectarAMongoDB();
        if (!client) {
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
// Obtener la coleccion de productos y buscar uno por su codigo
        const db = client.db("market");
        const market = await db.collection('market').findOne({ codigo : marketCodigo});
        if (market) {
            res.json(market);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send('Error al obtener el producto deseado')   // Manejo de error al obtener el producto
    } finally {
        await desconectarDeMongoDB();   // Desconexión de la base de datos
    }
});

// Ruta para obtener un producto por su nombre
app.get('/market/nombre/:nombre', async (req, res)=>{
    const marketNombre = req.params.nombre;
    const marketQuery = new RegExp(marketNombre, "i");
    try {
// Conexión a la base de datos
        const client = await conectarAMongoDB();
        if (!client) {
            res.status(500).send("Error al conectarse a MongoDB");
            return;
        }
// Obtener la coleccion de productos y buscar uno por su nombre        
        const db = client.db("market");
        const market = await db
        .collection("market")
        .find({ nombre : marketQuery })
        .toArray();
        if (market.length > 0) {
        res.json(market);
        } else {
        res.status(404).send('Producto no encontrado');
        }
    } catch (error) {
        res.status(500).send("Error al obtener el producto deseado")  //Manejo de errores al obtener el producto
    } finally {
        await desconectarDeMongoDB();    // Desconexión de la base de datos
    }
});

//Ruta para obtener un producto por su categoria
app.get('/market/categoria/:categoria', async (req, res)=>{
    const marketCategoria = req.params.categoria;
    const marketQuery = new RegExp(marketCategoria, "i");
    try {
// Conexión a la base de datos        
        const client = await conectarAMongoDB();
        if (!client) {
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
// Obtener la coleccion de productos y buscar uno por su categoria        
        const db = client.db("market");
        const market = await db
        .collection ("market")
        .find({ categoria: marketQuery })
        .toArray();
        if (market.length > 0) {
            res.json(market);
        } else {
            res.status(404).send('Producto no encontrado');
        }
    }catch (error) {
        res.status(500).send('Error al obtener la categoria deseada')  // Manejo de errores al buscar la categoria
    }finally {
        await desconectarDeMongoDB();   // Desconexión de la base de datos
    }
});

// Ruta para agregar un nuevo producto
app.post("/market", async (req, res)=>{
    const nuevoProducto = req.body;
    try {
// Conexión a la base de datos
        if (nuevoProducto === undefined) {
            res.status(400).send('Error en el formato de creacion');
        }
        const client = await conectarAMongoDB();
        if(!client) {
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
// Obtener la coleccion de productos y agregar uno
        const db = client.db("market");
        const collection = db.collection("market");
        await collection.insertOne(nuevoProducto);
        console.log('Producto agregado');
        res.status(201).send(nuevoProducto);
    } catch (error) {
        res.status(500).send('Error al intentar agregar un producto'); // Manejo de errores al agregar un prodcuto
    } finally {
        await desconectarDeMongoDB();   // Desconexión de la base de datos
    }
});

// Ruta para modificar el precio de un producto
app.patch("/market/:codigo", async (req, res)=>{
    const marketCodigo = parseInt(req.params.codigo);
    const nuevoPrecio = req.body;
    try {
// Conexión a la base de datos
        if (!nuevoPrecio) {
            res.status(400).send('Error en el formato de datos');
            return;
        }
        const client = await conectarAMongoDB();
        if (!client) {
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
// Obtener la coleccion de productos y modificar su precio
        const db = client.db("market");
        const collection = db.collection("market");
        await collection.updateOne({ codigo: marketCodigo }, { $set: { precio: nuevoPrecio.precio } });
        res.status(200).send(nuevoPrecio);
        console.log('Precio modificado');

    } catch (error) {
        res.status(500).send ('Error al modificar el precio');  // Manejo de errores al modificar el precio
    } finally {
        await desconectarDeMongoDB();   // Desconexión de la base de datos
    }
});

// Ruta para eliminar un producto 
app.delete("/market/:codigo", async (req,res)=>{
    const marketCodigo = parseInt(req.params.codigo);
    try {
// Conexión a la base de datos
        if(!marketCodigo) {
            res.status(400).send('Error en el formato de datos');
            return;
        }
        const client = await conectarAMongoDB();
        if (!client) {
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
// Obtener la coleccion de productos, buscar uno por su codigo y eliminarlo
        const db = client.db("market");
        const collection = db.collection("market");
        const resultado = await collection.deleteOne({ codigo: marketCodigo});
        if (resultado.deletedCount === 0) {
            res.status(404).send("No se encontro ningun producto");
        } else {
            console.log("Producto eliminado");
            res.status(204).send();
        }
    }catch (error) {
        res.status(500).send("Error al eliminar el producto");  // Manejo de errores al eliminar un producto
    }finally {
        await desconectarDeMongoDB();   //Desconexión de la base de datos
    }
});

// Manejo de rutas inexistentes
app.get('*', (req ,res) =>{
    res.send('Lo sentimos la ruta especificada no existe.')
  })

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });