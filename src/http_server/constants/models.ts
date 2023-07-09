export type DB = {
    players: Player[],
    rooms: Room[],
    games: Game[],
}

export type Player = {
    name: string,
    password: string,
    index: number,
}

export type Room = {
    indexRoom: number,
    roomUsers: Omit<Player, 'password'>[],
}

export type Game = {
    idGame: number,
    idPlayer1: number,
    idPlayer2: number,
}
export enum WsRequest {
    reg = 'reg',
    create_room ='create_room',
    start_game ='start_game',
    add_user_to_room = 'add_user_to_room',
}