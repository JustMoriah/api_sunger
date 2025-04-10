const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes');

app.use(routes); //para las rutas

app.use(bodyParser.json());

// Middleware para configurar las cabeceras CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Rutas de la API
app.use('/api', routes);

// Puerto
const PORT = 3006;

app.listen(PORT, () => {
  console.log(`Servidor API a la espera de consulta, por el puerto ${PORT}`);
});

//Modulo de cargador para recibir datos

app.post('/datos', (req, res) => {
  const { sensor, valor } = req.body;
        // Guardar en la base de datos
  res.json({ mensaje: "Datos recibidos" });
});

// escuchar todas las rutas
// Escuchar en todas las interfaces de red


