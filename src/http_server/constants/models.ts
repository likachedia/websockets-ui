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
    idPlayer1: {id: number, ships?: Ships[]},
    idPlayer2: {id: number, ships?: Ships[]},
    currentPlayer?: number
}

export type Ships = {
        position: {
            x: number,
            y: number,
        },
        direction: boolean,
        length: number,
        type: "small"|"medium"|"large"|"huge",
        coordinates?: Coordinates[],
        shot?: number,
        kill?: boolean,
}

export enum Status {
    miss = 'miss',
    killed = 'killed',
    shot = 'shot'
}

export type Coordinates = {
    x: number,
    y: number
}
export enum WsRequest {
    reg = 'reg',
    create_room ='create_room',
    start_game ='start_game',
    add_user_to_room = 'add_user_to_room',
    add_ships = 'add_ships',
    attack = 'attack'
}