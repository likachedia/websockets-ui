import { Game, Player, Status, Response } from "../constants/models";
import { addPlayer, addRoom, db } from "../db/db";
import {
  addCoordinatesToShip,
  calculateResult,
  generateRandomCoordinates,
} from "../utils";

export const registerPlayer = (m: string, clientId: number) => {
  const message = JSON.parse(m);
  const player = {
    name: message.name,
    password: message.password,
    index: clientId,
  };
  const error = addPlayer(player);

  const data = JSON.stringify({
    name: message.name,
    index: player.index,
    error: error,
    errorText: error ? `Player with the name ${message.name} is already exists`: "",
  });
  return {
    type: "reg",
    data,
    id: 0,
  };
};

export const addPlayerToRoom = (player: Omit<Player, "password">) => {
  const emptyRooms = db.rooms.filter((room) => room.roomUsers.length == 0);
  emptyRooms[0] = { ...emptyRooms[0], roomUsers: [player] };
  const index = db.rooms.findIndex(
    (room) => room.indexRoom == emptyRooms[0].indexRoom
  );
  db.rooms[index] = emptyRooms[0];
};

export const addSecondPlayer = (m, clientId: number) => {
  const message = JSON.parse(m);
  const player = db.players.filter((player) => player.index == clientId);
  const roomsWithOnePlayer = db.rooms.filter(
    (room) => room.indexRoom == message.indexRoom
  );
  const userInRoom = roomsWithOnePlayer[0].roomUsers;
  roomsWithOnePlayer[0] = {
    ...roomsWithOnePlayer[0],
    roomUsers: [...userInRoom, player[0]],
  };
  const roomsToUpdate = db.rooms.findIndex(
    (room) => room.indexRoom == message.indexRoom
  );
  db.rooms[roomsToUpdate] = roomsWithOnePlayer[0];
};

export const createRoom = (clientId) => {
  if (db.rooms.filter((room) => room.roomUsers.length == 0).length == 0) {
    const newRoom = {
      indexRoom: db.rooms.length,
      roomUsers: [],
    };
    addRoom(newRoom);
    const player = db.players.findIndex((player) => player.index == clientId);
    addPlayerToRoom(db.players[player]);
  }
};

export const updateRoom = () => {
  const data = db.rooms
    .filter((room) => room.roomUsers.length == 1)
    ?.map((room) => ({ roomId: room.indexRoom, roomUsers: room.roomUsers }));
  return {
    type: "update_room",
    data: JSON.stringify(data),
    id: 0,
  };
};

export const createGame = (m, clientId: number) => {
  const message = JSON.parse(m);
  addSecondPlayer(m, clientId);
  const room = db.rooms.findIndex(
    (room) => room.indexRoom == message.indexRoom
  );
  const roomForGame = db.rooms[room];
  const player1 = roomForGame.roomUsers[0].index;
  const player2 = roomForGame.roomUsers[1].index;
  const newGame: Game = {
    idGame: db.games.length,
    idPlayer1: { id: player1, kills: 0 },
    idPlayer2: { id: player2, kills: 0 },
    currentPlayer: player1,
  };
  db.games = [...db.games, newGame];
  return {
    idGame: newGame.idGame,
    player1,
    player2,
  };
};
export const removeRoom = (m) => {
  const message = JSON.parse(m);
  db.rooms.splice(message.indexRoom, 1);
  return updateRoom();
};

export const addShips = (m, clientId: number) => {
  const { gameId, ships, indexPlayer } = JSON.parse(m);
  const shipsWithCoordinates = addCoordinatesToShip(ships);
  const gameIndex = db.games.findIndex((game) => game.idGame == gameId);
  db.games[gameIndex].idPlayer1.id == indexPlayer
    ? (db.games[gameIndex].idPlayer1.ships = shipsWithCoordinates)
    : (db.games[gameIndex].idPlayer2.ships = shipsWithCoordinates);

  if (
    db.games[gameIndex].idPlayer1.ships &&
    db.games[gameIndex].idPlayer2.ships
  ) {
    return db.games[gameIndex];
  }
};

export const startGame = (gameId: number) => {
  const index = db.games.findIndex((game) => game.idGame == gameId);
  if (index !== -1) {
    return db.games[index];
  }
};

export const attack = (
  m,
): Status.ilegal_move | Response | undefined => {
  const { gameId, x, y, indexPlayer } = JSON.parse(m); // attack
  db.attacks = [...db.attacks, { x, y, idPlayer: indexPlayer }];
  const positions = { x, y };
  const game = db.games[gameId];

  if (game.currentPlayer !== indexPlayer) {
    return;
  }

  const currentPlayer =
    game.idPlayer1.id == indexPlayer ? game.idPlayer1 : game.idPlayer2;
  const ships =
    game.idPlayer1.id == indexPlayer
      ? game.idPlayer2.ships
      : game.idPlayer1.ships;
  const result = calculateResult(ships!, positions);

  if (result === Status.ilegal_move) {
    return result;
  }

  if (result === Status.miss) {
    game.currentPlayer =
      game.idPlayer1.id == indexPlayer ? game.idPlayer2.id : game.idPlayer1.id;
  }

  if (result === Status.killed) {
    currentPlayer.kills++;

    if (currentPlayer.kills === ships!.length) {
      updateWinner(currentPlayer.id);
      return {
        type: "finish",
        data: JSON.stringify({
          winPlayer: currentPlayer.id,
        }),
        id: 0,
      };
    }
  }

  const data = {
    position: { x, y },
    currentPlayer: indexPlayer,
    status: result,
  };
  return {
    type: "attack",
    data: JSON.stringify(data),
    id: 0,
  };
};

export const turn = (gameId: number) => {
  const game = db.games.filter((game) => game.idGame == gameId)[0];

  return {
    type: "turn",
    data: JSON.stringify({
      currentPlayer: game.currentPlayer ?? game.idPlayer1.id,
    }),
    id: 0,
  };
};

export const updateWinner = (winnerId: number) => {
  const winner = db.players.find((player) => player.index == winnerId)?.name;
  const existingWinner = db.winners.find((player) => player.id == winnerId);
  existingWinner
    ? existingWinner.wins++
    : (db.winners = [...db.winners, { id: winnerId, name: winner!, wins: 1 }]);
};

export const returnWinnersTable = () => {
  const winners = db.winners;
  return {
    type: "update_winners",
    data: JSON.stringify(winners),
    id: 0,
  };
};

export const randomAttack = (playerId: number) => {
  let attack = generateRandomCoordinates();
  let resAttack;
  let iteration = 0;
  const playerAttacks = db.attacks.filter(
    (attack) => attack.idPlayer == playerId
  );
  playerAttacks.forEach((a) => {
    if (a.x == attack.x && a.y == attack.y) {
      return;
    } else {
        iteration++;
    }
  });

  if(iteration == playerAttacks.length) {
    return attack;
  } else {
    randomAttack(playerId);
  }
};
