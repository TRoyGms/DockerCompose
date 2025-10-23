# ----------------------------- */
# Archivo: /backend/Dockerfile   */
# ----------------------------- */

# Usamos una imagen base oficial de Python (slim)
FROM python:3.10-slim

# Establecemos el directorio de trabajo
WORKDIR /code

# Copiamos primero el archivo de requisitos
COPY requirements.txt .

# Instalamos las dependencias
# --no-cache-dir ahorra espacio en la imagen final
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código fuente del backend
COPY . .

# Exponemos el puerto 8000 (el que usará FastAPI)
EXPOSE 8000

# Comando para iniciar el servidor Uvicorn
# Escucha en 0.0.0.0 para ser accesible desde fuera del contenedor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]