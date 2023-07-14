import { Coordinates, Game, Ships, Status } from "./http_server/constants/models";

export const messageParser = (message: string) => {
    const {type, data } = JSON.parse(message);
    const m = data ?? JSON.parse(data);
    return {
        type,
        m,
    }
}

export const shipCoordinates = (length, position, direction) => {
    let array: Coordinates[] = []
    if(length == 1) {
        // [{...position}]
        array = [{...position}]
    } else if(length > 1) {
        if(direction) {
            for(let i = 0; i < length; i++) {
                array.push({x: position.x+i, y: position.y});
            }
        } else {
            for(let i = 0; i < length; i++) {
                array.push({x: position.x, y: position.y + i});
            }
        }
        
    }

    return array;
}

export const addCoordinatesToShip = (ships: Ships[]): Ships[] => {
    const shipsWithCoordinates = ships.map((ship) => {
        const coordinates = shipCoordinates(ship.length, ship.position, ship.direction);
        return {
            ...ship,
            coordinates
        }
    })

    return shipsWithCoordinates;
}

export const buildData = (playerId: number, game: Game) => {
    const currentPlayerIndex = game.idPlayer1.id;
    const ships = game.idPlayer1.id == playerId ? game.idPlayer1.ships : game.idPlayer2.ships;
    const partialShips = ships?.map(ship => ({position: ship.position, direction: ship.direction, length: ship.length, type: ship.type}))
    const res = {
      type: "start_game",
      data: JSON.stringify(partialShips),
      currentPlayerIndex
    }
    return res;
}

export const calculateResult = (ships: Ships[], attack: {x: number, y: number}): Status => {
    let shot: boolean;

    ships.forEach(ship => {
        ship.coordinates?.forEach(coordinate => {
            if((coordinate.x == attack.x) && (coordinate.y == attack.y)) {
                ship.shot ? ship.shot++ : ship.shot = 1;
                shot = true;
            }
        })

        if(shot && (ship.length == ship.shot)) {
            ship.kill = true;
            return Status.killed;
        } else {
            return Status.shot;
        }
    })

    return Status.miss;
}