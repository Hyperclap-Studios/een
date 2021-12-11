import { Card } from './Card';

type GameState = 'waiting' | 'playing' | 'finished';

interface IClientGamePlayer {
    name: string,
    hasTurn: boolean,
}

class GamePlayer {
    public name: string;
    public uuid: string;
    public deck: Array<Card>;
    public hasTurn: boolean;

    constructor(name: string, uuid: string) {
        this.name = name;
        this.uuid = uuid;
        this.deck = new Array<Card>();
        this.hasTurn = false;
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
    public streak: number;

    constructor() {
        this.players = new Array<GamePlayer>()
        this.state = 'waiting';
        this.stack = [Game.getRandomCard(false)];
        this.reserve = Game.getReserve(100);
        this.streak = 0;
    }

    public reset() {
        this.state = 'waiting';
        this.stack = [Game.getRandomCard(false)];
        this.reserve = Game.getReserve(100);
        this.streak = 0;
    }

    public addPlayer(name: string, uuid: string): GamePlayer {
        const player = new GamePlayer(name, uuid);
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

    public getPlayer(uuid: string): GamePlayer | null {
        return this.players.find(p => p.uuid === uuid) ?? null;
    }

    public playerExists(uuid: string): boolean {
        return this.getPlayer(uuid) !== null;
    }

    public getClientPlayers(): Array<IClientGamePlayer> {
        return this.players.map(p => {
            return {
                name: p.name,
                hasTurn: p.hasTurn,
            }
        });
    }

    private static getReserve(amount: number) {
        const cards = new Array<Card>();
        for (let i = 0; i < amount; i++) {
            cards.push(Game.getRandomCard());
        }
        return cards;
    }

    private static getRandomCard(allowBlack = true): Card {
        const card = new Card();
        card.randomize(allowBlack);
        return card;
    }
}

export { GamePlayer, Game, IClientGamePlayer };