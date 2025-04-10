const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'db.xdn.com.mx',
  user: 'sunger',
  password: 'AwDXId8TqFOb3x5n',
  database: 'sunger'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Successful database connection');
});

module.exports = connection;
