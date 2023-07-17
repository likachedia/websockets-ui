import { Coordinates, Game, Response, Ships, Status } from "./constants/models";
import { removePlayer } from "./db/db";

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
        array = [{...position}]
    } else if(length > 1) {
        if(direction) {
            for(let i = 0; i < length; i++) {
                array.push({x: position.x, y: position.y+i});
            }
        } else {
            for(let i = 0; i < length; i++) {
                array.push({x: position.x+i, y: position.y });
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
    const currentPlayerIndex = playerId;
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
    let status: Status = Status.miss;
    ships.forEach(ship => {
        let shot: boolean = false;
        ship.coordinates?.forEach(coordinate => {
            if((coordinate.x == attack.x) && (coordinate.y == attack.y)) { 
                if(coordinate.shot) {
                    status = Status.ilegal_move;
                    return;
                }

                if(!ship.kill) {
                    ship.shot ? ship.shot++ : ship.shot = 1;
                }
                coordinate.shot = true;
                shot = true;
                return;
            }
        })

        if(status === Status.ilegal_move) {
            return;
        }

        if(shot && (ship.length == ship.shot)) {
            ship.kill = true;
            status =  Status.killed;
            return;
        }
        
        if(shot){
            status = Status.shot;
            return
        }
    })

    return status;
}


export const createGameData = (idPlayer: number, idGame: number): string => {
    return JSON.stringify({
        type: "create_game",
        data: JSON.stringify({
          idGame,
          idPlayer
        }),
        id: 0,
      })
}

export const isResponse = (obj: Response): obj is Response =>  {
    return 'type' in obj;
}

export const generateRandomCoordinates = () => {
   const  x =  Math.floor(Math.random() * 10);
   const y = Math.floor(Math.random() * 10);
   return {
    x, 
    y,
   }
}

export const clearePlayerData = (id: number) => {
    removePlayer(id);
}