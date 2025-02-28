# Usamos una imagen ligera de Node.js
FROM node:14-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de configuración y dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto de los archivos
COPY . .

# Exponemos el puerto 8080
EXPOSE 8080

# Ejecutamos el servidor
CMD ["npm", "start"]
