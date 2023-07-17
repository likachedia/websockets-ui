import { server } from "./src/http_server/index";
import WebSocket, { WebSocketServer } from 'ws';
import { messageParser, buildData, createGameData, isResponse, clearePlayerData } from './src/utils';
import { WsRequest } from "./src/constants/models";
import * as handler from './src/http_server/messageHandler';
import { IncomingMessage } from "http";
import { handleMessage } from './src/ws';

const HTTP_PORT = 8181;
const hostname = "127.0.0.1";
let id = 0;
const clients = new Map<number, WebSocket>();

function onSocketError(err) {
    console.error(err);
}

const wsServer = new WebSocketServer({ port: 3000, clientTracking: true});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
server.listen(HTTP_PORT);
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
    handleMessage(type, m, clientId, clients, ws);
  });

  clients.forEach((client, key) => {
    client.on('close', (code:number)=> {
      console.log(`Connection end with code ${code}, client ${key} disconnected`);
      clients.delete(key);
      clearePlayerData(key);
      const res = handler.updateRoom();
      client.send(JSON.stringify(res))
    })
  })
});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.on('error', onSocketError);
  wsServer.handleUpgrade(request, socket, head, function done(ws) {
    wsServer.emit('connection', ws, request,);
  });
});

process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  wsServer.close();
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  console.log(err);
});