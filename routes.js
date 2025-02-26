// routes.js
const express = require('express');
const router = express.Router();
const connection = require('./db');
const multer = require('multer');
const fs = require('fs');
const XLSX = require('xlsx');
const Papa = require('papaparse');

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
router.get('/users/contraseña/:contraseña', (req, res) => {
  const contraseña = req.params.contraseña;
  connection.query('SELECT * FROM usuarios WHERE contraseña = ?', contraseña, (err, results) => {
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
router.put('/users/:id', (req, res) => {
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
router.delete('/users/:id', (req, res) => {
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

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to handle CSV parsing
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    Papa.parse(fs.createReadStream(filePath), {
      complete: (result) => resolve(result.data),
      header: true,
      skipEmptyLines: true,
      error: reject,
    });
  });
};

// Helper function to handle Excel parsing
const parseExcel = (filePath) => {
  return new Promise((resolve, reject) => {
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);
    resolve(data);
  });
};

// **Route for uploading CSV file**
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const data = await parseCSV(req.file.path);
    
    // Insert parsed CSV data into the database
    data.forEach((row) => {
      const user = {
        name: row.name,
        correo: row.correo,
        contraseña: row.contraseña, // Example fields from CSV
        // Map other fields based on your CSV structure
      };

      connection.query('INSERT INTO usuarios SET ?', user, (err, results) => {
        if (err) {
          console.error('Error inserting CSV data:', err);
        }
      });
    });

    res.status(200).json({ message: 'CSV data uploaded and processed successfully' });
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    res.status(500).json({ error: 'Error processing CSV file' });
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
  }
});

// **Route for uploading Excel file**
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const data = await parseExcel(req.file.path);
    
    // Insert parsed Excel data into the database
    data.forEach((row) => {
      const user = {
        name: row.name,
        correo: row.correo,
        contraseña: row.contraseña, // Example fields from Excel
        // Map other fields based on your Excel structure
      };

      connection.query('INSERT INTO usuarios SET ?', user, (err, results) => {
        if (err) {
          console.error('Error inserting Excel data:', err);
        }
      });
    });

    res.status(200).json({ message: 'Excel data uploaded and processed successfully' });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    res.status(500).json({ error: 'Error processing Excel file' });
  } finally {
    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);
  }
});

module.exports = router;
