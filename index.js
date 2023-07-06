import { server } from "./src/http_server/index.js";
import { WebSocketServer } from 'ws';

const HTTP_PORT = 8181;

// export const wss = new WebSocketServer({ server });

// wss.on('connection', function connection(ws) {
//   ws.on('error', console.error);
//   console.log('connected');
//   ws.on('message', function message(data) {
//     console.log('received: %s', data);
//   });

//   ws.send('something');
// });
function onSocketError(err) {
    console.error(err);
  }
const wss = new WebSocketServer({ port: 3000 });
console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.listen(HTTP_PORT);
wss.on('connection', function connection(ws, request, client) {
  ws.on('error', console.error);
  console.log('connected');
  ws.on('message', function message(data) {
    console.log(`Received message ${data} from user ${client}`);
  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.on('error', onSocketError);
  wss.handleUpgrade(request, socket, head, function done(ws) {
    console.log('connected');
    wss.emit('connection', ws, request, client);
  });
  // This function is not defined on purpose. Implement it with your own logic.
//   authenticate(request, function next(err, client) {
//     if (err || !client) {
//       socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
//       socket.destroy();
//       return;
//     }

//     socket.removeListener('error', onSocketError);

//     wss.handleUpgrade(request, socket, head, function done(ws) {
//       wss.emit('connection', ws, request, client);
//     });
//   });
});
