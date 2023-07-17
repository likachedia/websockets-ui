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