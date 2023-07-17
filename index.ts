import { server } from "./src/http_server/index";
import { WebSocketServer } from 'ws';
// import { handleMessage } from './src/http_server/messageHandler';
import { messageParser, buildData, createGameData, isResponse } from './src/utils';
import { WsRequest } from "./src/http_server/constants/models";
import * as handler from './src/http_server/messageHandler';

const HTTP_PORT = 8181;
const hostname = "127.0.0.1";
let id = 0;
// const clients: { name: 'string', client: unknown}[] = [];
const clients = new Map();

function onSocketError(err) {
    console.error(err);
  }
const wss = new WebSocketServer({ port: 3000, clientTracking: true});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.listen(HTTP_PORT);

wss.on('connection', function connection(ws, request, client) {   
  ws.on('error', console.error);
  console.log(`Start websocket server at http://${hostname}:${HTTP_PORT}/!`);
  const clientId = id;
  id++;
  clients.set(clientId, ws);
  ws.on('message', function message(data) {
    const {type, m} = messageParser(data.toString());
    // const res = handleMessage(data.toString(), clientId)
    if(type == WsRequest.reg){
      const res = handler.registerPlayer(m, clientId);
      ws.send(JSON.stringify(res));
    }
    if(type == WsRequest.create_room){
      handler.createRoom(clientId);
      clients.forEach(client => {
        const res = handler.updateRoom();
          client.send(JSON.stringify(res));
      })
    }
    if(type == WsRequest.add_user_to_room){
      const createGameRes = handler.createGame(m, clientId);
      clients.get(createGameRes.player1).send(createGameData(createGameRes.player1, createGameRes.idGame));
      clients.get(createGameRes.player2).send(createGameData(createGameRes.player2, createGameRes.idGame));

      clients.forEach(client => {
        // client.send(JSON.stringify(createGameRes));
        const res = handler.removeRoom(m);
          client.send(JSON.stringify(res));
      })
    }
    if(type == WsRequest.add_ships) {
      const res = handler.addShips(m, clientId);
      if(res) {
        const data1 = buildData(res.idPlayer1.id, res);// start_game
        const data2 = buildData(res.idPlayer2.id, res);
        const turn = handler.turn(res.idGame);
        clients.get(res.idPlayer1.id).send(JSON.stringify(data1));
        clients.get(res.idPlayer2.id).send(JSON.stringify(data2));
        clients.get(res.idPlayer1.id).send(JSON.stringify(turn));
        clients.get(res.idPlayer2.id).send(JSON.stringify(turn));
      }
    }

    if(type == WsRequest.attack) {
      const { gameId } = JSON.parse(m);
      const resAttak = handler.attack(m, clientId);
      const turn = handler.turn(gameId);
      clients.forEach(client => {
        if(resAttak){
          client.send(JSON.stringify(resAttak));
        }
        if(resAttak && typeof resAttak != 'string'){
          if(resAttak.type == WsRequest.finish) {
            const res = handler.returnWinnersTable();
            // client.send(JSON.stringify(resAttak));
            client.send(JSON.stringify(res));
          }    
          
          if(resAttak.type == WsRequest.attack) {
            client.send(JSON.stringify(turn));
          }
        }
        client.send(JSON.stringify(turn))
      })
    }

    if(type === WsRequest.random_attack) {
      const { gameId, indexPlayer } = JSON.parse(m);
      // const coordinates = generateRandomCoordinates();
      const resAttak = handler.attack(m, clientId);
    }

  });
});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.on('error', onSocketError);
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit('connection', ws, request,);
  });
});

process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  // some other closing procedures go here
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  console.log(err);
});