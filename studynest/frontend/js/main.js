const API_URL = 'http://localhost:5000/api';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    cargarMaterias();
});

function verificarSesion() {
    const userId = localStorage.getItem('usuarioId');
    const userName = localStorage.getItem('usuarioNombre');

    if (!userId) {
        // Redirigir a login si no hay sesión
        window.location.href = 'index.html'; 
    }

    if (document.getElementById('userName')) {
        document.getElementById('userName').textContent = userName;
    }
}

async function cargarMaterias() {
    const userId = localStorage.getItem('usuarioId');
    const grid = document.getElementById('subjectsGrid');
    
    try {
        const response = await fetch(`${API_URL}/materias?usuarioId=${userId}`, {
            headers: { 'usuario-id': userId }
        });
        const materias = await response.json();

        grid.innerHTML = '';

        if (materias.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #7f8c8d; margin-top: 50px;">Aún no estás inscrito en ninguna materia. ¡Usa un código para unirte!</p>';
            return;
        }

        materias.forEach(materia => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.style.borderTopColor = materia.color;
            
            card.innerHTML = `
                <div class="card-content">
                    <div class="subject-code">${materia.codigo}</div>
                    <div class="subject-name">${materia.nombre}</div>
                    <div class="professor-name">
                        <i class="fa-solid fa-user-tie"></i> ${materia.profesor}
                    </div>
                </div>
                <div class="card-footer">
                    <small style="color: #3498db; font-weight: 600;">Ver detalles <i class="fa-solid fa-chevron-right"></i></small>
                </div>
            `;
            
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error al cargar materias:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

async function enrollClass() {
    const codeInput = document.getElementById('classCode');
    const code = codeInput.value.toUpperCase().trim();
    const userId = localStorage.getItem('usuarioId');

    if (!code) return alert('Ingresa un código válido');

    try {
        const response = await fetch(`${API_URL}/inscribir`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'usuario-id': userId 
            },
            body: JSON.stringify({ codigo: code, usuarioId: userId })
        });

        const result = await response.json();

        if (response.ok) {
            alert('¡Te has unido exitosamente!');
            codeInput.value = '';
            cargarMaterias(); // Recargar el dashboard
        } else {
            alert(result.error || 'Error al unirse a la clase');
        }
    } catch (error) {
        console.error('Error al inscribir:', error);
        alert('Error de conexión con el servidor');
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

// --- FUNCIONES AUXILIARES PARA NUEVAS CARACTERÍSTICAS (FASE 2) ---

// Obtener perfil del usuario actual
async function obtenerPerfil() {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/usuarios/perfil`, {
            headers: { 'usuario-id': userId }
        });
        if (!response.ok) throw new Error('Error al obtener perfil');
        return await response.ok ? response.json() : null;
    } catch (error) {
        console.error('Error en obtenerPerfil:', error);
        return null;
    }
}

// Actualizar perfil del usuario actual (Nombre y foto/avatar)
async function actualizarPerfil(nombre, foto) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/usuarios/perfil`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': userId
            },
            body: JSON.stringify({ nombre, foto })
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('usuarioNombre', nombre); // Actualizar sesión local
        }
        return result;
    } catch (error) {
        console.error('Error en actualizarPerfil:', error);
        return { error: 'Error de conexión' };
    }
}

// Obtener los compañeros inscritos en una materia
async function obtenerCompaneros(materiaId) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/materias/${materiaId}/companeros`, {
            headers: { 'usuario-id': userId }
        });
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerCompaneros:', error);
        return [];
    }
}

// Obtener mensajes del foro/chat de una materia
async function obtenerMensajesForo(materiaId) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/materias/${materiaId}/mensajes`, {
            headers: { 'usuario-id': userId }
        });
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerMensajesForo:', error);
        return [];
    }
}

// Enviar un mensaje al foro/chat de una materia
async function enviarMensajeForo(materiaId, mensaje) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/materias/${materiaId}/mensajes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': userId
            },
            body: JSON.stringify({ mensaje })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en enviarMensajeForo:', error);
        return { error: 'Error de conexión' };
    }
}

// Obtener las tareas de una materia (incluye estatus de completada para el usuario)
async function obtenerTareas(materiaId) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/materias/${materiaId}/tareas`, {
            headers: { 'usuario-id': userId }
        });
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerTareas:', error);
        return [];
    }
}

// Crear una nueva tarea para una materia
async function crearTarea(materiaId, titulo, descripcion, fechaEntrega) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/materias/${materiaId}/tareas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': userId
            },
            body: JSON.stringify({ titulo, descripcion, fecha_entrega: fechaEntrega })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en crearTarea:', error);
        return { error: 'Error de conexión' };
    }
}

// Alternar estatus de completado de una tarea
async function alternarCompletarTarea(tareaId, completada) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/tareas/${tareaId}/completar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': userId
            },
            body: JSON.stringify({ completada })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en alternarCompletarTarea:', error);
        return { error: 'Error de conexión' };
    }
}

// Obtener comentarios de una tarea
async function obtenerComentariosTarea(tareaId) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/tareas/${tareaId}/comentarios`, {
            headers: { 'usuario-id': userId }
        });
        return await response.json();
    } catch (error) {
        console.error('Error en obtenerComentariosTarea:', error);
        return [];
    }
}

// Agregar un comentario a una tarea
async function agregarComentarioTarea(tareaId, comentario) {
    const userId = localStorage.getItem('usuarioId');
    try {
        const response = await fetch(`${API_URL}/tareas/${tareaId}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': userId
            },
            body: JSON.stringify({ comentario })
        });
        return await response.json();
    } catch (error) {
        console.error('Error en agregarComentarioTarea:', error);
        return { error: 'Error de conexión' };
    }
}
