import { server } from "./src/http_server/index";
import WebSocket, { WebSocketServer } from 'ws';
import { messageParser, buildData, createGameData, isResponse } from './src/utils';
import { WsRequest } from "./src/constants/models";
import * as handler from './src/http_server/messageHandler';
import { IncomingMessage } from "http";
import { json } from "stream/consumers";

const HTTP_PORT = 8181;
const hostname = "127.0.0.1";
let id = 0;
const clients = new Map();

function onSocketError(err) {
    console.error(err);
}

const wsServer = new WebSocketServer({ port: 3000, clientTracking: true});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.listen(HTTP_PORT);
// wsServer.on('open', (ws, request) => {
//   console.log(`Start websocket server at http://${hostname}:${HTTP_PORT}/!, ${request}`);
// })
wsServer.on('connection', function connection(ws:WebSocket, request:IncomingMessage, client) {  
  ws.on('error', console.error);
  ws.on('open', () => {console.log('open')})
  console.log(`Start websocket server at http://${hostname}:${HTTP_PORT}/!`);
  const clientId = id;
  id++;
  clients.set(clientId, ws);
  ws.on('message', function message(data) {
    console.log(`Message came from user ${clientId} - ${data}`);
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
      const resAttak = handler.attack(m);
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
      const resAttak = handler.randomAttack(indexPlayer);

      if(resAttak) {
        const attackInfo = JSON.stringify({gameId, x: resAttak.x, y: resAttak.y, indexPlayer })
        const res = handler.attack(attackInfo);
        const turn = handler.turn(gameId);
        clients.forEach(client => {
          client.send(JSON.stringify(res));
          client.send(JSON.stringify(turn))
        })
      }
    }

  });

  ws.on('close', (code:number)=> {
    console.log(`Connection end with code ${code}`)
  })
});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.on('error', onSocketError);
  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    console.log(``)
    // wsServer.emit('open',  ws, request,);
    wsServer.emit('connection', ws, request,);
  });
});

process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  wsServer.close()
  // some other closing procedures go here
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  console.log(err);
});