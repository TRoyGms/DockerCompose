# ------------------------------ */
# Archivo: /frontend/Dockerfile   */
# ------------------------------ */

# --- Etapa 1: Construcción (Build) ---
# Usamos una imagen de Node para construir la app
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Etapa 2: Servidor (Serve) ---
# Usamos una imagen ligera de node para el servidor final
FROM node:20-slim
WORKDIR /app
# Instalamos 'serve' globalmente para servir archivos estáticos
RUN npm install -g serve
# Copiamos SOLO los archivos estáticos construidos de la etapa 'builder'
COPY --from=builder /app/dist .

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para iniciar el servidor
# 'serve -s .' sirve el contenido del directorio actual
CMD ["serve", "-s", ".", "-l", "3000"]