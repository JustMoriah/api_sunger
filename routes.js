// routes.js
const express = require('express');
const router = express.Router();
const connection = require('./db');
const multer = require('multer');
const xlsx = require('xlsx');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Obtener todos los users
router.get('/users', (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener users:', err);
      res.status(500).json({ error: 'Error al obtener users' });
      return;
    }
    res.json(results);
  });
});

// Obtener un registro por su e-mail
router.get('/users/correo/:correo', (req, res) => {
    const correo = req.params.correo;
    connection.query('SELECT * FROM usuarios WHERE correo = ?', correo, (err, results) => {
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
router.get('/users/contrasena/:contrasena', (req, res) => {
  const contrasena = req.params.contrasena;
  connection.query('SELECT * FROM usuarios WHERE contrasena = ?', contrasena, (err, results) => {
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

// Obtener un registro por su ID
router.get('/users/id/:id_usuario', (req, res) => {
  const id_usuario = req.params.id_usuario;
  connection.query('SELECT * FROM usuarios WHERE id_usuario = ?', id_usuario, (err, results) => {
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
  connection.query('INSERT INTO usuarios SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo registro:', err);
      res.status(500).json({ error: 'Error al crear un nuevo registro' });
      return;
    }
    res.status(201).json({ message: 'Registro creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/users/id/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE usuarios SET ? WHERE id_usuario = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
      return;
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/users/id/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM usuarios WHERE id_usuario = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el registro:', err);
      res.status(500).json({ error: 'Error al eliminar el registro' });
      return;
    }
    res.json({ message: 'Registro eliminado exitosamente' });
  });
});

// Subir un Excel
router.post("/subir-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  console.log("Archivo recibido:", req.file.originalname);

  try {
    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("Datos leídos del archivo:", worksheet);

    // Process and insert data into the database
    let registrosInsertados = 0;
    let registrosDuplicados = 0;
    console.log("Worksheet Data:", worksheet);
    for (const row of worksheet) {
      let { id_rol, nombre, apellido, fn, correo, contrasena } = row;
      
      console.log('Checking row data:', row);
      // Check if data is valid before insertion
      if (!id_rol || !nombre || !apellido || !fn || !correo || !contrasena) {
        console.log("Faltan datos en la fila, no se insertará:", row);
        continue; // Skip row if missing data
      }
      else{
        console.log("Error");
      }

      const usuarioExistente = await new Promise((resolve, reject) => {
        connection.query("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (usuarioExistente.length > 0) {
        registrosDuplicados++;
      } else {
        await new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO usuarios (id_rol, nombre, apellido, fn, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?)",
            [id_rol, nombre, apellido, fn, correo, contrasena],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
        registrosInsertados++;
      }
    }

    res.json({ registrosInsertados, registrosDuplicados });
  } catch (error) {
    console.error("Error al procesar archivo:", error);
    res.status(500).json({ error: "Error al procesar el archivo." });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
//Role stuff
// Obtener todos los roles
router.get('/roles', (req, res) => {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.error('Error al obtener roles:', err);
      res.status(500).json({ error: 'Error al obtener roles' });
      return;
    }
    res.json(results);
  });
});

// Obtener un rol por su ID
router.get('/roles/id/:id_rol', (req, res) => {
  const id_rol = req.params.id_rol;
  connection.query('SELECT * FROM roles WHERE id_rol = ?', id_rol, (err, results) => {
    if (err) {
      console.error('Error al obtener el rol:', err);
      res.status(500).json({ error: 'Error al obtener el rol' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Registro no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo rol
router.post('/roles', (req, res) => {
  const nuevoRegistro = req.body;
  connection.query('INSERT INTO roles SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo rol:', err);
      res.status(500).json({ error: 'Error al crear un nuevo rol' });
      return;
    }
    res.status(201).json({ message: 'Rol creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/roles/id/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE roles SET ? WHERE id_rol = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el rol:', err);
      res.status(500).json({ error: 'Error al actualizar el rol' });
      return;
    }
    res.json({ message: 'Rol actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/roles/id/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM roles WHERE id_rol = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el rol:', err);
      res.status(500).json({ error: 'Error al eliminar el rol' });
      return;
    }
    res.json({ message: 'Rol eliminado exitosamente' });
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
//Charger stuff
// Obtener todos los cargadores
router.get('/chargers', (req, res) => {
  connection.query('SELECT * FROM cargador', (err, results) => {
    if (err) {
      console.error('Error al obtener cargadores:', err);
      res.status(500).json({ error: 'Error al obtener cargadores' });
      return;
    }
    res.json(results);
  });
});

// Obtener un cargador por su ID
router.get('/chargers/id/:id_cargador', (req, res) => {
  const id_cargador = req.params.id_cargador;
  connection.query('SELECT * FROM cargador WHERE id_cargador = ?', id_cargador, (err, results) => {
    if (err) {
      console.error('Error al obtener el cargador:', err);
      res.status(500).json({ error: 'Error al obtener el cargador' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Cargador no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo cargador
router.post('/chargers', (req, res) => {
  const nuevoRegistro = req.body;
  connection.query('INSERT INTO cargador SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo cargador:', err);
      res.status(500).json({ error: 'Error al crear un nuevo cargador' });
      return;
    }
    res.status(201).json({ message: 'Cargador creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/chargers/id/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE cargador SET ? WHERE id_cargador = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el cargador:', err);
      res.status(500).json({ error: 'Error al actualizar el cargador' });
      return;
    }
    res.json({ message: 'Cargador actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/chargers/id/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM cargador WHERE id_cargador = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el cargador:', err);
      res.status(500).json({ error: 'Error al eliminar el cargador' });
      return;
    }
    res.json({ message: 'Cargador eliminado exitosamente' });
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
//Maintenance stuff
// Obtener todos los cargadores
router.get('/maintenance', (req, res) => {
  connection.query('SELECT * FROM mantenimientos', (err, results) => {
    if (err) {
      console.error('Error al obtener historial:', err);
      res.status(500).json({ error: 'Error al obtener historial' });
      return;
    }
    res.json(results);
  });
});

// Obtener un cargador por su ID
router.get('/maintenance/id/:id_historial', (req, res) => {
  const id_historial = req.params.id_historial;
  connection.query('SELECT * FROM mantenimientos WHERE id_historial = ?', id_historial, (err, results) => {
    if (err) {
      console.error('Error al obtener el historial:', err);
      res.status(500).json({ error: 'Error al obtener el historial' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Historial no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo cargador
router.post('/maintenance', (req, res) => {
  const nuevoRegistro = req.body;
  connection.query('INSERT INTO mantenimientos SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo historial:', err);
      res.status(500).json({ error: 'Error al crear un nuevo historial' });
      return;
    }
    res.status(201).json({ message: 'Historial creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/maintenance/id/:id', (req, res) => {
  const id = req.params.id;
  const datosActualizados = req.body;
  connection.query('UPDATE mantenimientos SET ? WHERE id_historial = ?', [datosActualizados, id], (err, results) => {
    if (err) {
      console.error('Error al actualizar el historial:', err);
      res.status(500).json({ error: 'Error al actualizar el historial' });
      return;
    }
    res.json({ message: 'Historial actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/maintenance/id/:id', (req, res) => {
  const id = req.params.id;
  connection.query('DELETE FROM mantenimientos WHERE id_historial = ?', id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el historial:', err);
      res.status(500).json({ error: 'Error al eliminar el historial' });
      return;
    }
    res.json({ message: 'Historial eliminado exitosamente' });
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
//Login stuff
// Obtener todos los logins
router.get('/logins', (req, res) => {
  connection.query('SELECT * FROM login', (err, results) => {
    if (err) {
      console.error('Error al obtener login:', err);
      res.status(500).json({ error: 'Error al obtener login' });
      return;
    }
    res.json(results);
  });
});

// Obtener un cargador por su ID
router.get('/logins/id/:id_registro', (req, res) => {
  const id_registro = req.params.id_registro;
  connection.query('SELECT * FROM login WHERE id_registro = ?', id_registro, (err, results) => {
    if (err) {
      console.error('Error al obtener el login:', err);
      res.status(500).json({ error: 'Error al obtener el login' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Login no encontrado' });
      return;
    }
    res.json(results[0]);
  });
});

// Crear un nuevo cargador
router.post('/logins', (req, res) => {
  const nuevoRegistro = req.body;
  connection.query('INSERT INTO login SET ?', nuevoRegistro, (err, results) => {
    if (err) {
      console.error('Error al crear un nuevo registro:', err);
      res.status(500).json({ error: 'Error al crear un nuevo registro' });
      return;
    }
    res.status(201).json({ message: 'Registro creado exitosamente' });
  });
});

// Actualizar un registro
router.put('/logins/id/:id_registro', (req, res) => {
  const id_registro = req.params.id_registro;
  const datosActualizados = req.body;
  connection.query('UPDATE login SET ? WHERE id_registro = ?', [datosActualizados, id_registro], (err, results) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
      return;
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  });
});

// Eliminar un registro
router.delete('/logins/id/:id_registro', (req, res) => {
  const id_registro = req.params.id_registro;
  connection.query('DELETE FROM login WHERE id_registro = ?', id_registro, (err, results) => {
    if (err) {
      console.error('Error al eliminar el registro:', err);
      res.status(500).json({ error: 'Error al eliminar el registro' });
      return;
    }
    res.json({ message: 'Registro eliminado exitosamente' });
  });
});

module.exports = router;
