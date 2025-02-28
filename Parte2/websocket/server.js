// server.js
const WebSocket = require('ws');
const port = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port }, () => {
  console.log(`Servidor WebSocket escuchando en el puerto ${port}`);
});

wss.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Al recibir un mensaje, se le envía una respuesta de eco
  socket.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`);
    socket.send(`Eco: ${message}`);
  });

  socket.on('close', () => {
    console.log('Cliente desconectado');
  });
});
