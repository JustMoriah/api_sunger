const mysql = require('mysql');  // Importa el módulo de MySQL para Node.js

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'db.xdn.com.mx',         // Dirección del host de la base de datos
  user: 'sunger',                // Usuario de la base de datos
  password: 'AwDXId8TqFOb3x5n',  // Contraseña del usuario
  database: 'sunger'             // Nombre de la base de datos
});

// Establecer la conexión
connection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err); // Mensaje de error si la conexión falla
    return;
  }
  console.log('Successful database connection');       // Mensaje si la conexión es exitosa
});

module.exports = connection; // Exporta la conexión para ser utilizada en otros módulos
