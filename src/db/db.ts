import { DB, Player } from "../constants/models";

export const db: DB = {
    players: [],
    games: [],
    rooms: [],
    winners: [],
    attacks: [],
}

export const addPlayer = (newPlayer: Player) => {
    if(db.players.find(player => player.name == newPlayer.name)){
        return true;
    } else {
        db.players = [...db.players, newPlayer];
        return false;
    }
    
}

export const addRoom = (room) => {
    db.rooms = [...db.rooms, room];
}

export const getDb = () => {
    return db;
}

export const removeRoom = (roomdId: number) => {
    db.rooms.splice(roomdId, 1);
}
export const removeGame = (gameId: number) => {
    db.games.splice(gameId, 1);
}
export const removePlayer = (palyerID: number) => {
    const playerIndex = db.players.findIndex(player => player.index == palyerID);
    const roomindex = db.rooms.findIndex(room => room.roomUsers.find(user => user.index == palyerID));
    const gameIndex = db.games.findIndex(game => (game.idPlayer1.id == palyerID) || (game.idPlayer2.id == palyerID));
    removeRoom(roomindex);
    removeGame(gameIndex);
    db.players.splice(playerIndex, 1);
}