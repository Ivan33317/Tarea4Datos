// main.dart
import 'package:flutter/material.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  final String title = 'Demo WebSocket';
  // Conecta al servidor; si ejecutas la app en un emulador, "localhost" funciona.
  // En un dispositivo físico, usa la IP de tu PC.
  final channel = IOWebSocketChannel.connect('ws://localhost:8080');

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: title,
      home: MyHomePage(channel: channel, title: title),
    );
  }
}

class MyHomePage extends StatefulWidget {
  final WebSocketChannel channel;
  final String title;

  const MyHomePage({Key? key, required this.channel, required this.title})
      : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final TextEditingController _controller = TextEditingController();
  String respuesta = '';

  @override
  void initState() {
    super.initState();
    widget.channel.stream.listen((message) {
      setState(() {
        respuesta = message;
      });
    });
  }

  void _enviarMensaje() {
    if (_controller.text.isNotEmpty) {
      widget.channel.sink.add(_controller.text);
    }
  }

  @override
  void dispose() {
    widget.channel.sink.close();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            TextField(
              controller: _controller,
              decoration:
                  const InputDecoration(labelText: 'Escribe un mensaje'),
            ),
            ElevatedButton(
              onPressed: _enviarMensaje,
              child: const Text('Enviar'),
            ),
            const SizedBox(height: 20),
            Text('Respuesta del servidor: $respuesta'),
          ],
        ),
      ),
    );
  }
}
