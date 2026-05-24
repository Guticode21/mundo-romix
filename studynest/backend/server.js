const express = require('express');
const { admin, db } = require('./firebase');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
// Helper functions for Firestore operations
const firebaseHelpers = require('./firebase-helpers');
// Initialize reminder scheduler
require('./reminderScheduler');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

const app = express();
// duplicate import removed
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Firebase Firestore already initialized;

// --- AUTH ROUTES ---

// Registration
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('usuarios').doc(email).set({
            nombre,
            password: hashedPassword,
            creadoEn: admin.firestore.Timestamp.now()
        });
        res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ error: 'Error al crear la cuenta' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    try {
        const userDoc = await db.collection('usuarios').doc(email).get();
        if (!userDoc.exists) return res.status(401).json({ error: 'Credenciales inválidas' });
        const user = userDoc.data();
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });
        res.json({ success: true, user: { id: userDoc.id, nombre: user.nombre } });
    } catch (err) {
        console.error('Error in login:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
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

// [REMOVED] Materia-related routes and forum removed per user request
// [REMOVED] Materia‑related routes and forum removed per user request
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful error handling for common startup issues
server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.error(`⚠️ Port ${PORT} already in use. Free the port or change the PORT value in .env.`);
        process.exit(1);
    } else {
        console.error('Unexpected server error:', err);
    }
});

/*** GROUP MANAGEMENT ROUTES ***/

// Create a new study group
app.post('/api/grupos', validateUser, async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre del grupo es obligatorio' });
    try {
        const groupRef = await db.collection('grupos').add({
            nombre,
            descripcion: descripcion || '',
            creadorId: req.usuarioId,
            creadoEn: admin.firestore.Timestamp.now()
        });
        res.status(201).json({ success: true, grupoId: groupRef.id });
    } catch (err) {
        console.error('Error creando grupo:', err);
        res.status(500).json({ error: 'Error al crear el grupo' });
    }
});

// Add a member to a group
app.post('/api/grupos/:id/miembros', validateUser, async (req, res) => {
    const grupoId = req.params.id;
    const { usuarioId } = req.body; // id of user to add; if omitted, add the requester
    const memberId = usuarioId || req.usuarioId;
    try {
        const groupSnap = await db.collection('grupos').doc(grupoId).get();
        if (!groupSnap.exists) return res.status(404).json({ error: 'Grupo no encontrado' });
        // Prevent duplicate membership
        const existing = await db.collection('grupos').doc(grupoId).collection('miembros')
            .where('usuarioId', '==', memberId).limit(1).get();
        if (!existing.empty) return res.status(400).json({ error: 'El usuario ya pertenece al grupo' });
        await db.collection('grupos').doc(grupoId).collection('miembros')
            .add({ usuarioId: memberId, agregadoEn: admin.firestore.Timestamp.now() });
        res.json({ success: true, message: 'Miembro agregado al grupo' });
    } catch (err) {
        console.error('Error agregando miembro:', err);
        res.status(500).json({ error: 'Error al agregar miembro' });
    }
});

// List members of a group
app.get('/api/grupos/:id/miembros', validateUser, async (req, res) => {
    const grupoId = req.params.id;
    try {
        const membersSnap = await db.collection('grupos').doc(grupoId).collection('miembros').get();
        const memberIds = membersSnap.docs.map(d => d.data().usuarioId);
        if (memberIds.length === 0) return res.json([]);
        const usersSnap = await db.collection('usuarios')
            .where(admin.firestore.FieldPath.documentId(), 'in', memberIds)
            .get();
        const members = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(members);
    } catch (err) {
        console.error('Error listando miembros:', err);
        res.status(500).json({ error: 'Error al obtener los miembros' });
    }
});

// Get group chat messages
app.get('/api/grupos/:id/mensajes', validateUser, async (req, res) => {
    const grupoId = req.params.id;
    try {
        const msgsSnap = await db.collection('grupos').doc(grupoId).collection('mensajes')
            .orderBy('fechaEnvio')
            .get();
        const msgs = await Promise.all(msgsSnap.docs.map(async doc => {
            const data = doc.data();
            const userDoc = await db.collection('usuarios').doc(data.usuarioId).get();
            const user = userDoc.data() || {};
            return {
                id: doc.id,
                mensaje: data.mensaje,
                fechaEnvio: data.fechaEnvio,
                usuarioId: data.usuarioId,
                usuarioNombre: user.nombre,
                usuarioFoto: user.foto
            };
        }));
        res.json(msgs);
    } catch (err) {
        console.error('Error obteniendo mensajes del grupo:', err);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

// Post a new message to group chat
app.post('/api/grupos/:id/mensajes', validateUser, async (req, res) => {
    const grupoId = req.params.id;
    const { mensaje } = req.body;
    if (!mensaje || mensaje.trim() === '') return res.status(400).json({ error: 'Mensaje vacío' });
    try {
        await db.collection('grupos').doc(grupoId).collection('mensajes').add({
            usuarioId: req.usuarioId,
            mensaje,
            fechaEnvio: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ success: true, message: 'Mensaje enviado' });
    } catch (err) {
        console.error('Error enviando mensaje de grupo:', err);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

// Create a reminder for a group
app.post('/api/grupos/:id/reminders', validateUser, async (req, res) => {
    const grupoId = req.params.id;
    const { titulo, fechaLimite } = req.body;
    if (!titulo || !fechaLimite) return res.status(400).json({ error: 'Título y fecha límite son requeridos' });
    try {
        const ref = await db.collection('grupos').doc(grupoId).collection('recordatorios').add({
            titulo,
            fechaLimite: admin.firestore.Timestamp.fromDate(new Date(fechaLimite)),
            completado: false,
            creadoEn: admin.firestore.Timestamp.now()
        });
        res.status(201).json({ success: true, reminderId: ref.id });
    } catch (err) {
        console.error('Error creando recordatorio:', err);
        res.status(500).json({ error: 'Error al crear recordatorio' });
    }
});

// List reminders for a group
app.get('/api/grupos/:id/reminders', validateUser, async (req, res) => {
    const grupoId = req.params.id;
    try {
        const snap = await db.collection('grupos').doc(grupoId).collection('recordatorios')
            .orderBy('fechaLimite')
            .get();
        const reminders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json(reminders);
    } catch (err) {
        console.error('Error listando recordatorios:', err);
        res.status(500).json({ error: 'Error al obtener recordatorios' });
    }
});

// Update reminder (mark completed)
app.put('/api/grupos/:id/reminders/:reminderId', validateUser, async (req, res) => {
    const { id, reminderId } = req.params;
    const { completado } = req.body;
    try {
        await db.collection('grupos').doc(id).collection('recordatorios')
            .doc(reminderId).update({ completado: !!completado });
        res.json({ success: true, message: 'Recordatorio actualizado' });
    } catch (err) {
        console.error('Error actualizando recordatorio:', err);
        res.status(500).json({ error: 'Error al actualizar recordatorio' });
    }
});

// List groups for the current user (creator only for now)
app.get('/api/grupos', validateUser, async (req, res) => {
    const userId = req.usuarioId;
    try {
        const snap = await db.collection('grupos').where('creadorId', '==', userId).get();
        const groups = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json(groups);
    } catch (err) {
        console.error('Error listing groups:', err);
        res.status(500).json({ error: 'Error al obtener grupos' });
    }
});

// ----- Materia routes -----
app.get('/api/materias', validateUser, async (req, res) => {
  // TODO: Implement fetching subjects from Firestore
  res.json([]);
});

app.post('/api/inscribir', validateUser, async (req, res) => {
  const { codigo } = req.body;
  // TODO: Validate codigo and add user to subject
  res.json({ success: true, message: 'Inscripción simulada' });
});
