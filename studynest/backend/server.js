const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const path = require('path');
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'studynest'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// --- AUTH ROUTES ---

// Registration
app.post('/api/registro', (req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    const query = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
    db.query(query, [nombre, email, password], (err, results) => {
        if (err) {
            console.error('Error in registration:', err);
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El email ya está registrado' });
            return res.status(500).json({ error: 'Error al crear la cuenta' });
        }
        res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

    const query = 'SELECT id, nombre FROM usuarios WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error in login:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        res.json({ success: true, user: results[0] });
    });
});

// Middleware to validate user
const validateUser = (req, res, next) => {
    const usuarioId = req.headers['usuario-id'] || req.body.usuarioId || req.query.usuarioId;
    if (!usuarioId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    req.usuarioId = usuarioId;
    next();
};

// Get enrolled subjects for a user
app.get('/api/materias', validateUser, (req, res) => {
    const query = `
        SELECT m.* 
        FROM materias m
        JOIN inscripciones i ON m.id = i.materia_id
        WHERE i.usuario_id = ?
    `;
    db.query(query, [req.usuarioId], (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Enroll in a subject by code
app.post('/api/inscribir', validateUser, (req, res) => {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'Código de materia requerido' });

    console.log(`Enrolling user ${req.usuarioId} in class ${codigo}`);

    // Find the subject by code
    db.query('SELECT id FROM materias WHERE codigo = ?', [codigo], (err, results) => {
        if (err) {
            console.error('Error finding subject:', err);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) return res.status(404).json({ error: 'Materia no encontrada con ese código' });

        const materiaId = results[0].id;

        // Check if already enrolled
        db.query('SELECT * FROM inscripciones WHERE usuario_id = ? AND materia_id = ?', 
        [req.usuarioId, materiaId], (err, insc) => {
            if (err) {
                console.error('Error checking enrollment:', err);
                return res.status(500).json({ error: err.message });
            }
            if (insc.length > 0) return res.status(400).json({ error: 'Ya estás inscrito en esta materia' });

            // Insert enrollment
            db.query('INSERT INTO inscripciones (usuario_id, materia_id) VALUES (?, ?)', 
            [req.usuarioId, materiaId], (err) => {
                if (err) {
                    console.error('Error inserting enrollment:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ success: true, message: 'Inscripción exitosa' });
            });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
