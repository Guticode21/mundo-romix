const API_URL = 'http://localhost:3000/api';

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
