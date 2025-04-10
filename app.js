const express = require('express');               // Importa el framework Express
const app = express();                            // Crea una instancia de la aplicación
const bodyParser = require('body-parser');        // Importa body-parser para procesar JSON en las peticiones
const routes = require('./routes');               // Importa las rutas definidas en otro archivo

app.use(routes);                                  // Usa las rutas importadas

app.use(bodyParser.json());                       // Middleware para parsear el cuerpo de las solicitudes en formato JSON

// Middleware para configurar las cabeceras CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');                      // Permite acceso desde cualquier origen
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeceras permitidas
  next(); // Continua con la siguiente función middleware
});

app.use('/api', routes);                         // Define el prefijo '/api' para todas las rutas importadas

// Puerto
const PORT = 3006;                               // Puerto en el que se ejecutará el servidor

app.listen(PORT, () => {
  console.log(`Servidor API a la espera de consulta, por el puerto ${PORT}`); // Mensaje al iniciar el servidor
});

// Modulo de cargador para recibir datos
app.post('/datos', (req, res) => {
  const { sensor, valor } = req.body;           // Extrae datos del cuerpo de la solicitud
        // Guardar en la base de datos          // Aquí iría la lógica para guardar los datos en la BD
  res.json({ mensaje: "Datos recibidos" });     // Respuesta al cliente
});

// Comentario general, el servidor escucha conexiones desde cualquier IP
