import { Card } from './Card';

type GameState = 'waiting' | 'playing' | 'finished';

class GamePlayer {
    public uuid: string;
    public deck: Array<Card>;

    constructor(uuid: string) {
        this.uuid = uuid;
        this.deck = new Array<Card>();
    }
}


class Game {
    public players: Array<GamePlayer>;
    public state: GameState;


    constructor() {
        this.players = new Array<GamePlayer>()
        this.state = 'waiting';
    }

    public addPlayer(uuid: string): GamePlayer {
        const player: GamePlayer = {
            uuid,
            deck: new Array<Card>(),
        };
        this.players.push(player);
        return player;
    }

    public removePlayer(uuid: string): boolean {
        const player = this.players.find(p => p.uuid === uuid);
        if (player) {
            this.players.splice(this.players.indexOf(player), 1);
            return true;
        }
        return false;
    }
}

export { GamePlayer, Game };