const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('usuarioId', data.user.id);
                    localStorage.setItem('usuarioNombre', data.user.nombre);
                                                            window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Error al iniciar sesión');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${API_URL}/registro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error || 'Error al registrarse');
                }
            } catch (error) {
                console.error('Register error:', error);
                alert('Error de conexión con el servidor');
            }
        });
    }
});
