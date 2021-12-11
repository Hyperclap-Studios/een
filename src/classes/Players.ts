import {generateUUID} from "../lib/helpers";
import {sign, verify} from 'jsonwebtoken';


class Player {
    public name: string;
    public uuid: string;

    constructor(name: string) {
        this.name = name;
        this.uuid = generateUUID();
    }

    public getJWT(): string {
        if (process.env.JWT_SECRET) {
            return sign({
                uuid: this.uuid,
                name: this.name
            }, process.env.JWT_SECRET);
        }
        return '';
    }

    public validateJWT(token: string): boolean {
        if (process.env.JWT_SECRET) {
            try {
                verify(token, process.env.JWT_SECRET);
                return true;
            } catch (e: any) {
                console.log('JWT validation error: ', e.message);
            }
        }
        return false;
    }
}

class Players {
    public players: Array<Player>;
    public playerCount: number;

    constructor() {
        this.players = new Array<Player>();
        this.playerCount = 0;
    }

    public addPlayer(name: string): Player {
        const player = new Player(name);
        this.players.push(player);
        this.playerCount++;
        return player;
    }

    public removePlayer(uuid: string): boolean {
        const player = this.getPlayer(uuid);
        if (player) {
            this.players.splice(this.players.indexOf(player), 1);
            this.playerCount--;
            return true;
        }
        return false;
    }

    public getPlayer(uuid: string): Player | null {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].uuid === uuid) {
                return this.players[i];
            }
        }
        return null;
    }

}

export { Player, Players };