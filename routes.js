// routes.js
const express = require('express');
const router = express.Router();
const connection = require('./db');

// Obtener todos los users
router.get('/users', (req, res) => {
  connection.query('SELECT * FROM user_table', (err, results) => {
    if (err) {
      console.error('Error al obtener users:', err);
      res.status(500).json({ error: 'Error al obtener users' });
      return;
    }
    res.json(results);
  });
});

// Obtener un registro por su id
router.get('/users/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM user_table WHERE id_user = ?', id, (err, results) => {

      if (err) {
        console.error('Error al obtener el registro:', err);
        res.status(500).json({ error: 'Error al obtener el registro' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      res.json(results[0]);
    });
});

// Obtener un registro por su e-mail
router.get('/users/:email', (req, res) => {
    const email = req.params.email;
    connection.query('SELECT * FROM user_table WHERE email = ?', email, (err, results) => {
      if (err) {
        console.error('Error al obtener el registro:', err);
        res.status(500).json({ error: 'Error al obtener el registro' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return;
      }
      res.json(results[0]);
    });
});

// Obtener un registro por su password
router.get('/users/:passwd', (req, res) => {
  const passwd = req.params.passwd;
  connection.query('SELECT * FROM user_table WHERE passwd = ?', passwd, (err, results) => {
    if (err) {
      console.error('Error al obtener el registro:', err);
      res.status(500).json({ error: 'Error al obtener el registro' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo registro
router.post('/users', (req, res) => {
  const nuevoRegistro = req.body;
  connection.query('INSERT INTO user_table SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo registro:', err);
      res.status(500).json({ error: 'Error al crear un nuevo registro' });
      return;
    }
    res.status(201).json({ message: 'Registro creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE user_table SET ? WHERE id_user = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
      return;
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM user_table WHERE id_user = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el registro:', err);
      res.status(500).json({ error: 'Error al eliminar el registro' });
      return;
    }
    res.json({ message: 'Registro eliminado exitosamente' });
  });
});


module.exports = router;
