CREATE DATABASE IF NOT EXISTS studynest;
USE studynest;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    profesor VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3498db'
);

CREATE TABLE IF NOT EXISTS inscripciones (
    usuario_id INT,
    materia_id INT,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, materia_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);

-- Insert some dummy data for testing
INSERT IGNORE INTO usuarios (id, nombre, email, password) VALUES
(1, 'Estudiante de Prueba', 'test@example.com', '123456');

INSERT IGNORE INTO materias (codigo, nombre, profesor, color) VALUES
('CAL1', 'Cálculo I', 'Dr. Arnaldo Smith', '#e74c3c'),
('FIS2', 'Física II', 'Ing. Laura Gómez', '#2ecc71'),
('PROG', 'Programación Avanzada', 'Lic. Kevin Mitnick', '#f1c40f');
