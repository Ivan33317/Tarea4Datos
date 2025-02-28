FROM instrumentisto/coturn

# Copiamos el archivo de configuración al directorio que utiliza coturn
COPY turnserver.conf /etc/coturn/turnserver.conf

# Exponemos el puerto 3478 para UDP y TCP
EXPOSE 3478/udp
EXPOSE 3478/tcp

# Iniciamos el servidor TURN sin interfaz CLI
CMD ["turnserver", "-c", "/etc/coturn/turnserver.conf", "--no-cli"]
