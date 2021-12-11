import { Card } from './Card';

type GameState = 'waiting' | 'playing' | 'finished';

class GamePlayer {
    public uuid: string;
    public deck: Array<Card>;

    constructor(uuid: string) {
        this.uuid = uuid;
        this.deck = new Array<Card>();
    }

    public fillDeck(amount: number) {
        for (let i = 0; i < amount; i++) {
            const card = new Card();
            card.randomize();
            this.deck.push(card);
        }
    }
}


class Game {
    public players: Array<GamePlayer>;
    public state: GameState;
    public stack: Array<Card>;
    public reserve: Array<Card>;

    constructor() {
        this.players = new Array<GamePlayer>()
        this.state = 'waiting';
        this.stack = [Game.getRandomCard()];
        this.reserve = Game.getReserve(100);
    }

    public reset() {
        this.state = 'waiting';
        this.stack = [Game.getRandomCard()];
        this.reserve = Game.getReserve(100);
    }

    public addPlayer(uuid: string): GamePlayer {
        const player = new GamePlayer(uuid);
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

    private static getReserve(amount: number) {
        const cards = new Array<Card>();
        for (let i = 0; i < amount; i++) {
            const card = new Card();
            card.randomize();
            cards.push(card);
        }
        return cards;
    }

    private static getRandomCard(): Card {
        const card = new Card();
        card.randomize();
        return card;
    }
}

export { GamePlayer, Game };