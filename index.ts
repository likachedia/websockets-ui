import { server } from "./src/http_server/index";
import { WebSocketServer } from 'ws';
// import { handleMessage } from './src/http_server/messageHandler';
import { messageParser, buildData } from './src/utils';
import { WsRequest } from "./src/http_server/constants/models";
import * as handler from './src/http_server/messageHandler';

const HTTP_PORT = 8181;
let id = 0;
// const clients: { name: 'string', client: unknown}[] = [];
const clients = new Map();

function onSocketError(err) {
    console.error(err);
  }
const wss = new WebSocketServer({ port: 3000, clientTracking: true});
console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.listen(HTTP_PORT);
// wss.getUniqueID = 1;
wss.on('connection', function connection(ws, request, client) {
 
  ws.on('error', console.error);
  console.log(`Start websocket server on the ${HTTP_PORT} port!`);
  const clientId = id;
  id +=1;
  clients.set(clientId, ws);
  // let res;
  // clients.forEach(client => {
  //   if(res && JSON.parse(res).type == "update_room") {
  //     client.send(JSON.stringify(res));
  //   }
  // })

  ws.on('message', function message(data) {
    console.log(`Received message ${data} from user ${clientId}`);
    const {type, m} = messageParser(data.toString());
    // const res = handleMessage(data.toString(), clientId)
    if(type == WsRequest.reg){
      const res = handler.registerPlayer(m, clientId);
      ws.send(JSON.stringify(res));
    }
    if(type == WsRequest.create_room){
      handler.createRoom(clientId);
      // ws.send(JSON.stringify(res));
      clients.forEach(client => {
        const res = handler.updateRoom();
          client.send(JSON.stringify(res));   
      })
    }
    if(type == WsRequest.add_user_to_room){
      // handler.addSecondPlayer(m, clientId);
      // handler.updateRoom();
      const createGameRes = handler.createGame(m, clientId);
      // ws.send(JSON.stringify(res));
      clients.forEach(client => {
        client.send(JSON.stringify(createGameRes));
        const res = handler.removeRoom(m);
          client.send(JSON.stringify(res)); 
      })
    }
    if(type == WsRequest.add_ships) {
      const res = handler.addShips(m, clientId);
      if(res) {
        const data1 = buildData(res.idPlayer1.id, res);
        const data2 = buildData(res.idPlayer2.id, res);
        clients.get(res.idPlayer1.id).send(JSON.stringify(data1));
        clients.get(res.idPlayer2.id).send(JSON.stringify(data2));
      }
    }

    if(type == WsRequest.attack) {
        handler.attack(m, clientId)
    }

    // if(res && res.type == "update_room") {
    //   clients.forEach(client => {
    //       client.send(JSON.stringify(res));      
    //   })
    // } else {
    //   console.log(res)
    //   ws.send(JSON.stringify(res));
    // }
  });


});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.on('error', onSocketError);
  wss.handleUpgrade(request, socket, head, function done(ws) {
    console.log('connected', 'from');
    wss.emit('connection', ws, request,);
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

