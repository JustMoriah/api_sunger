// Importación de dependencias necesarias
const express = require('express');
const router = express.Router(); // Crea un enrutador de Express
const connection = require('./db'); // Conexión a la base de datos
const multer = require('multer'); // Middleware para manejar archivos
const xlsx = require('xlsx'); // Lectura de archivos Excel
const cors = require("cors"); // Middleware para permitir CORS

// Configuración de almacenamiento en memoria para archivos subidos
const storage = multer.memoryStorage();
const upload = multer({ storage });

///////////////////////////////////////////////////////////////////////////////////////////
// USERS
///////////////////////////////////////////////////////////////////////////////////////////

// Obtener todos los usuarios
router.get('/users', (req, res) => {
  connection.query('SELECT * FROM usuarios', (err, results) => {
    // Manejo de error
    if (err) {
      console.error('Error al obtener users:', err);
      res.status(500).json({ error: 'Error al obtener users' });
      return;
    }
    // Respuesta con la lista de usuarios
    res.json(results);
  });
});

// Obtener un usuario por correo
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

// Obtener usuario por contraseña
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

// Obtener usuario por ID
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

// Crear un nuevo usuario
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

// Actualizar un usuario por ID
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

// Eliminar un usuario por ID
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

// Subida de archivo Excel para usuarios
router.post("/subir-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  // Lectura y conversión del archivo Excel
  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Inicialización de contadores
  let registrosInsertados = 0;
  let registrosDuplicados = 0;
  let registrosFaltantes = 0;

  // Procesamiento de cada fila del Excel
  for (const row of worksheet) {
    let { id_rol, nombre, apellido, fn, genero, correo, contrasena, activo } = row;

    if (!id_rol || !nombre || !apellido || !fn || !genero || !correo || !contrasena || !activo) {
      row.status = "Datos faltantes";
      registrosFaltantes++;
      continue;
    }

    // Verifica duplicados
    const usuarioExistente = await new Promise((resolve, reject) => {
      connection.query("SELECT * FROM usuarios WHERE correo = ?", [correo], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Inserta si no existe
    if (usuarioExistente.length > 0) {
      row.status = "Duplicado";
      registrosDuplicados++;
    } else {
      await new Promise((resolve, reject) => {
        connection.query(
          "INSERT INTO usuarios (id_rol, nombre, apellido, fn, genero, correo, contrasena, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [id_rol, nombre, apellido, fn, genero, correo, contrasena, activo],
          (err, results) => {
            if (err) reject(err);
            resolve(results);
          }
        );
      });
      row.status = "Subido";
      registrosInsertados++;
    }
  }

  // Devuelve un resumen del procesamiento
  res.json({
    registrosInsertados,
    registrosDuplicados,
    registrosFaltantes,
    data: worksheet,
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
// ROLES
///////////////////////////////////////////////////////////////////////////////////////////

// Obtener todos los roles
router.get('/roles', (req, res) => {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) {
      console.error('Error al obtener roles:', err);
      res.status(500).json({ error: 'Error al obtener roles' });
      return;
    }
    res.json(results); // Devuelve todos los registros de la tabla 'roles'
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
    res.json(results[0]); // Devuelve el rol específico
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

// Actualizar un rol existente por ID
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

// Eliminar un rol por ID
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

// Subida de archivo Excel para roles
router.post("/role-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  console.log("Archivo recibido:", req.file.originalname);

  try {
    // Leer el archivo Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("Datos leídos del archivo:", worksheet);

    let registrosInsertados = 0;
    let registrosDuplicados = 0;
    let registrosFaltantes = 0;

    // Procesar cada fila
    for (const row of worksheet) {
      let { nombre_rol, permisos } = row;

      // Validar campos
      if (!nombre_rol || !permisos) {
        row.status = "Datos faltantes";
        registrosFaltantes++;
        continue;
      }

      // Verificar si el rol ya existe
      const rolExistente = await new Promise((resolve, reject) => {
        connection.query("SELECT * FROM roles WHERE nombre_rol = ?", [nombre_rol], (err, results) => {
          if (err) reject(err);
          resolve(results);
        });
      });

      if (rolExistente.length > 0) {
        row.status = "Duplicado";
        registrosDuplicados++;
      } else {
        // Insertar nuevo rol
        await new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO roles (nombre_rol, permisos) VALUES (?, ?)",
            [nombre_rol, permisos],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
        row.status = "Subido";
        registrosInsertados++;
      }
    }

    // Enviar resumen y resultados
    res.json({
      registrosInsertados,
      registrosDuplicados,
      registrosFaltantes,
      data: worksheet,
    });
  } catch (error) {
    console.error("Error al procesar archivo:", error);
    res.status(500).json({ error: "Error al procesar el archivo." });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
// CHARGERS (CARGADORES)
///////////////////////////////////////////////////////////////////////////////////////////

// Obtener todos los cargadores
router.get('/chargers', (req, res) => {
  connection.query('SELECT * FROM cargador', (err, results) => {
    if (err) {
      console.error('Error al obtener cargadores:', err);
      res.status(500).json({ error: 'Error al obtener cargadores' });
      return;
    }
    res.json(results); // Devuelve todos los registros de la tabla 'cargador'
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
    res.json(results[0]); // Devuelve el cargador específico
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

// Actualizar un cargador por ID
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

// Eliminar un cargador por ID
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

// Subir datos de cargadores desde un archivo Excel
router.post("/charger-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  console.log("Archivo recibido:", req.file.originalname);

  try {
    // Leer el archivo Excel
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("Datos leídos del archivo:", worksheet);

    let registrosInsertados = 0;
    let registrosFaltantes = 0;

    // Procesar cada fila del Excel
    for (const row of worksheet) {
      let { ubicacion, estado } = row;

      // Validar que no falten campos
      if (!ubicacion || !estado) {
        row.status = "Datos faltantes";
        registrosFaltantes++;
        console.log("Fila con datos faltantes:", row);
        continue;
      }

      try {
        // Insertar datos en la base de datos
        await new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO cargador (ubicacion, estado) VALUES (?, ?)",
            [ubicacion, estado],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
        row.status = "Subido";
        registrosInsertados++;
      } catch (err) {
        row.status = "Error al insertar";
        console.error("Error al insertar la fila:", row, err);
      }
    }

    console.log("Datos a enviar:", worksheet);

    // Enviar resultados del procesamiento
    res.json({
      registrosInsertados,
      registrosFaltantes,
      data: worksheet,
    });
  } catch (error) {
    console.error("Error al procesar archivo:", error);
    res.status(500).json({ error: "Error al procesar el archivo." });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
// MAINTENANCE (MANTENIMIENTOS)
///////////////////////////////////////////////////////////////////////////////////////////

// Obtener todos los registros de mantenimiento
router.get('/maintenance', (req, res) => {
  connection.query('SELECT * FROM mantenimientos', (err, results) => {
    if (err) {
      console.error('Error al obtener historial:', err);
      res.status(500).json({ error: 'Error al obtener historial' });
      return;
    }
    res.json(results); // Devuelve todos los mantenimientos
  });
});

// Obtener un registro de mantenimiento por ID
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
    res.json(results[0]); // Devuelve el mantenimiento específico
  });
});

// Crear un nuevo registro de mantenimiento
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

// Actualizar un registro de mantenimiento
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

// Eliminar un registro de mantenimiento
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

// Subir un archivo Excel con registros de mantenimiento
router.post("/maintenance-excel", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo." });
  }

  console.log("Archivo recibido:", req.file.originalname);

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log("Datos leídos del archivo:", worksheet);

    let registrosInsertados = 0;
    let registrosFaltantes = 0;

    for (const row of worksheet) {
      let { id_cargador, id_usuario, fecha, tipo, descripcion } = row;

      // Validar que no falten campos requeridos
      if (!id_cargador || !id_usuario || !fecha || !tipo || !descripcion) {
        row.status = "Datos faltantes";
        registrosFaltantes++;
        console.log("Fila con datos faltantes:", row);
        continue;
      }

      try {
        // Insertar el mantenimiento en la base de datos
        await new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO mantenimientos (id_cargador, id_usuario, fecha, tipo, descripcion) VALUES (?, ?, ?, ?, ?)",
            [id_cargador, id_usuario, fecha, tipo, descripcion],
            (err, results) => {
              if (err) reject(err);
              resolve(results);
            }
          );
        });
        row.status = "Subido";
        registrosInsertados++;
      } catch (err) {
        row.status = "Error al insertar";
        console.error("Error al insertar la fila:", row, err);
      }
    }

    console.log("Datos a enviar:", worksheet);

    // Devolver resumen del proceso
    res.json({
      registrosInsertados,
      registrosFaltantes,
      data: worksheet,
    });
  } catch (error) {
    console.error("Error al procesar archivo:", error);
    res.status(500).json({ error: "Error al procesar el archivo." });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////
// LOGIN
///////////////////////////////////////////////////////////////////////////////////////////

// Obtener todos los registros de login
router.get('/logins', (req, res) => {
  connection.query('SELECT * FROM login', (err, results) => {
    if (err) {
      console.error('Error al obtener login:', err);
      res.status(500).json({ error: 'Error al obtener login' });
      return;
    }
    res.json(results); // Devuelve todos los logins
  });
});

// Obtener un registro de login por ID
router.get('/logins/id/:id_log', (req, res) => {
  const id_log = req.params.id_log;
  connection.query('SELECT * FROM login WHERE id_log = ?', id_log, (err, results) => {
    if (err) {
      console.error('Error al obtener el login:', err);
      res.status(500).json({ error: 'Error al obtener el login' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Login no encontrado' });
      return;
    }
    res.json(results[0]); // Devuelve el login específico
  });
});

// Crear un nuevo registro de login
router.post('/logins', (req, res) => {
  const { id_usuario, accion, hora } = req.body;

  // Validación básica de campos
  if (!id_usuario || isNaN(id_usuario)) {
    return res.status(400).json({ error: 'Invalid id_usuario' });
  }
  if (!accion || !hora) {
    return res.status(400).json({ error: 'Accion or hora cannot be empty' });
  }

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

// Actualizar un registro de login por ID
router.put('/logins/id/:id_log', (req, res) => {
  const id_log = req.params.id_log;
  const datosActualizados = req.body;
  connection.query('UPDATE login SET ? WHERE id_log = ?', [datosActualizados, id_log], (err, results) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
      return;
    }
    res.json({ message: 'Registro actualizado exitosamente' });
  });
});

// Eliminar un registro de login
router.delete('/logins/id/:id_log', (req, res) => {
  const id_log = req.params.id_log;
  connection.query('DELETE FROM login WHERE id_log = ?', id_log, (err, results) => {
    if (err) {
      console.error('Error al eliminar el registro:', err);
      res.status(500).json({ error: 'Error al eliminar el registro' });
      return;
    }
    res.json({ message: 'Registro eliminado exitosamente' });
  });
});

///////////////////////////////////////////////////////////////////////////////////////////
// VOLTAJE Y CORRIENTE (ESP32 API)
///////////////////////////////////////////////////////////////////////////////////////////

// Middleware para procesar JSON en el router
router.use(express.json());

// Obtener datos de energía
router.get('/get/voltaje', (req, res) => {
  connection.query('SELECT * FROM energia', (err, results) => {
    if (err) {
      console.error('Error al obtener datos de energia:', err);
      res.status(500).json({ error: 'Error al obtener datos de energia' });
      return;
    }
    res.json(results); // Devuelve los registros de energía (voltaje, corriente)
  });
});

// Crear una instancia de express para este servidor aparte
const app = express();
app.use(express.json());
app.use(cors());

// Iniciar el servidor para datos del ESP32
const PORT = 3007;
app.listen(PORT, () => {
  console.log(`Servidor API a la espera de consulta, por el puerto ${PORT}`);
});

// Recibir datos del ESP32 y guardarlos en la base de datos
app.post('/api/voltaje', (req, res) => {
  const { voltaje, corriente } = req.body;

  console.log("Voltaje recibido:", voltaje);
  console.log("Corriente recibida:", corriente);

  if (voltaje === undefined || corriente === undefined) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const sql = "INSERT INTO energia (voltaje, corriente) VALUES (?, ?)";
  const values = [voltaje, corriente];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error al insertar datos:", err);
      return res.status(500).json({ error: "Error al insertar datos en la base de datos" });
    }

    console.log("Datos de energía insertados exitosamente");
    res.json({ message: "Datos guardados correctamente" });
  });
});

// (No se usa esta ruta correctamente porque está mal definida, debería ser .get('/api/datos'))
app.get("api/datos", (req, res) => {
  const { voltaje, corriente } = req.body;
  console.log(voltaje);
});

module.exports = router;
