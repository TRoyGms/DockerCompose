-- Le decimos a MySQL que use la base de datos
-- que 'docker-compose' ya creó.
USE rodrigo_db;

-- Creamos la tabla 'todos' si no existe
CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (Opcional) Insertamos una tarea de ejemplo
-- para que la app no arranque vacía.
INSERT INTO todos (task) VALUES ('Configurar Docker Compose');
INSERT INTO todos (task) VALUES ('Subir proyecto a AWS');