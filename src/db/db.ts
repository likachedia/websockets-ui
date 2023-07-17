import { DB, Player } from "../http_server/constants/models";

export const db: DB = {
    players: [],
    games: [],
    rooms: [],
    winners: []
}

export const addPlayer = (newPlayer: Player) => {
    db.players = [...db.players, newPlayer];
}

export const addRoom = (room) => {
    db.rooms = [...db.rooms, room];
}

export const getDb = () => {
    return db;
}