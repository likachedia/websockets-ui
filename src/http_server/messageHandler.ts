import { Game, Player, Ships, WsRequest } from "./constants/models";
import { addPlayer, getDb, addRoom, db } from "../db/db";
import { shipCoordinates, addCoordinatesToShip, calculateResult} from "../utils"

// const db = getDb();

export const handleMessage = (message: string, clientId: number) => {
    const {type, data } = JSON.parse(message);
    const m = data ?? JSON.parse(data);
    console.log(message, 'message');
    console.log(data, m);
    if(type === WsRequest.reg) {
        return registerPlayer(m, clientId);
    } else if (type === WsRequest.create_room) {
        return createRoom(clientId);
    } else if(type === WsRequest.add_user_to_room) {   
        addSecondPlayer(m,clientId);
        console.log(m, db);
        const message = JSON.parse(m)
        const room = db.rooms.filter(room => room.indexRoom == message.indexRoom);
        console.log(room);
        const enemyId = db.rooms.filter(room => room.indexRoom == message.indexRoom)?.[0].roomUsers[0].index;
        return createGame(enemyId, clientId);
    }

}

export const registerPlayer = (m: string, clientId: number) => {
    const message = JSON.parse(m);
    console.log(message)
    console.log(typeof message)
    const player = {
        name: message.name,
        password: message.password,
        index: clientId,
    }
    addPlayer(player);

    const data = JSON.stringify({
        name: message.name,
        index: db.players.length,
        error: false,
        errorText: '',
    },)
    return {
        type: "reg",
        data,
        id: 0,
    }
}

export const addPlayerToRoom = (player: Omit<Player, 'password'>) => {
    const emptyRooms = db.rooms.filter(room => room.roomUsers.length == 0);
    // const roomsWithOnePlayer = db.rooms.filter(room => room.roomUsers.length == 1);
    // roomsWithOnePlayer ? roomsWithOnePlayer[0] = {...roomsWithOnePlayer[0], roomUsers: [player]} :
    // emptyRooms[0]
    //update db
    emptyRooms[0] = {...emptyRooms[0], roomUsers: [player]};
   const index = db.rooms.findIndex(room => room.indexRoom == emptyRooms[0].indexRoom);
    db.rooms[index] = emptyRooms[0];
    console.log()
}

export const addSecondPlayer = (m, clientId: number) => {
    const message = JSON.parse(m);
    const player = db.players.filter(player => player.index == clientId);
    const roomsWithOnePlayer = db.rooms.filter(room => room.indexRoom == message.indexRoom);
    // db.rooms.filter(room => room.indexRoom == m.indexRoom)[0].roomUsers.push()
    const userInRoom = roomsWithOnePlayer[0].roomUsers;
    roomsWithOnePlayer[0] = {...roomsWithOnePlayer[0], roomUsers: [...userInRoom, player[0]]};
    console.log(db, 'fr');
    const roomsToUpdate = db.rooms.findIndex(room => room.indexRoom == message.indexRoom);
    db.rooms[roomsToUpdate] = roomsWithOnePlayer[0];
    
    // updateRoom
    //createGame
}

export const createRoom = (clientId) => {
    if(db.rooms.filter(room => room.roomUsers.length == 0).length == 0) {
        const newRoom = {
            indexRoom: db.rooms.length,
            roomUsers: [],
        }
        addRoom(newRoom);
        const player = db.players.findIndex(player => player.index == clientId);
        addPlayerToRoom(db.players[player]);
    }

    // addPlayerToRoom(db.players[0]);
    // return updateRoom();
}

export const updateRoom = () => {
    const data = db.rooms.filter(room => room.roomUsers.length == 1)?.map(room => ({roomId: room.indexRoom, roomUsers: room.roomUsers}))
   return {
        type: "update_room",
        data: JSON.stringify(data),
        id: 0,
    }
}

export const createGame = (m, clientId: number) => {
    const message = JSON.parse(m);
    addSecondPlayer(m,clientId);
    const room = db.rooms.findIndex(room => room.indexRoom == message.indexRoom);
    console.log(room);
    // const gameIndex = db.rooms.filter(room => room.)
    const roomForGame = db.rooms[room];
    const player1 = roomForGame.roomUsers[0].index;
    console.log(roomForGame.roomUsers)
    const player2 = roomForGame.roomUsers[1].index;
    // const enemyId = db.rooms.filter(room => room.indexRoom == m.indexRoom)?.[0].roomUsers.filter(user => user.index != clientId)[0].index
    const newGame: Game = { idGame: db.games.length, idPlayer1: {id: player1} , idPlayer2: {id: player2}};
    db.games = [...db.games, newGame];
    const dataToReturn = {
        idGame: newGame.idGame,
        idPlayer: clientId == player1 ? player1 : player2,
    }
    return {
        type: "create_game",
        data: JSON.stringify(dataToReturn),
        id: 0,
    }
}
export const removeRoom = (m) => {
    const message = JSON.parse(m);
    db.rooms.splice(message.indexRoom, 1);
    return updateRoom();
}

export const addShips = (m, clientId: number) => {
    const {gameId, ships, indexPlayer} = JSON.parse(m);
    // console.log(typeof ships)
    // const parsedShips: Ships[] = JSON.parse(ships);
    const shipsWithCoordinates = addCoordinatesToShip(ships);
    const gameIndex = db.games.findIndex(game => game.idGame == gameId);

    db.games[gameIndex].idPlayer1.id == clientId ? db.games[gameIndex].idPlayer1.ships = shipsWithCoordinates : db.games[gameIndex].idPlayer2.ships = shipsWithCoordinates;
   
    if(db.games[gameIndex].idPlayer1.ships && db.games[gameIndex].idPlayer2.ships) {
        return db.games[gameIndex];
    }
}

export const startGame = (gameId: number) => {
    const index = db.games.findIndex(game => game.idGame == gameId);
    if(index !== -1) {
        return db.games[index];
    }
}

export const attack = (m, clientId: number) => {
    const {gameId, x, y, indexPlayer} = JSON.parse(m);
//    const result =  calculateResult()
}