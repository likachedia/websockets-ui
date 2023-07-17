export type DB = {
    players: Player[],
    rooms: Room[],
    games: Game[],
    winners: WinnersTable[]
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
    idPlayer1: {id: number, ships?: Ships[], kills: number},
    idPlayer2: {id: number, ships?: Ships[], kills: number},
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
    shot = 'shot',
    ilegal_move = 'ilegal_move',
}

export type Coordinates = {
    x: number,
    y: number,
    shot?: boolean;
}

export type WinnersTable = {
    id: number,
    name: string,
    wins: number,
}

export type Response = {
    type: string,
    data: string,
    id: number,
}
export enum WsRequest {
    reg = 'reg',
    create_room ='create_room',
    start_game ='start_game',
    add_user_to_room = 'add_user_to_room',
    add_ships = 'add_ships',
    attack = 'attack',
    random_attack = 'randomAttack',
    finish = 'finish'
}