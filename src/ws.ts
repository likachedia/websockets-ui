
import WebSocket, { WebSocketServer } from 'ws';
import { messageParser, buildData, createGameData, isResponse } from '../src/utils';
import { WsRequest } from "../src/constants/models";
import * as handler from '../src/http_server/messageHandler';

export const handleMessage = (type:WsRequest, m, clientId: number, clients: Map<number, WebSocket>, ws: WebSocket) => {
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
        clients?.get(createGameRes.player1)?.send(createGameData(createGameRes.player1, createGameRes.idGame));
        clients?.get(createGameRes.player2)?.send(createGameData(createGameRes.player2, createGameRes.idGame));
  
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
          clients?.get(res.idPlayer1.id)?.send(JSON.stringify(data1));
          clients?.get(res.idPlayer2.id)?.send(JSON.stringify(data2));
          clients?.get(res.idPlayer1.id)?.send(JSON.stringify(turn));
          clients?.get(res.idPlayer2.id)?.send(JSON.stringify(turn));
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
}

