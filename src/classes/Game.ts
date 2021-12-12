import { Card } from './Card';
import {Player} from "./Players";

type GameState = 'waiting' | 'playing' | 'finished';

interface IClientGamePlayer {
    name: string,
    hasTurn: boolean,
    isReady: boolean,
}

interface IGameConfig {
    reserveSize?: number,
    deckSize?: number,
}

class GamePlayer {
    public player: Player;
    public deck: Array<Card>;
    public hasTurn: boolean;
    public lastPing: number;
    public ready: boolean;

    constructor(player: Player) {
        this.player = player;
        this.deck = new Array<Card>();
        this.hasTurn = false;
        this.lastPing = Date.now();
        this.ready = false;
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
    public config: IGameConfig;

    constructor(config: IGameConfig = {}) {
        this.config = {
            reserveSize: 100,
            deckSize: 6,
            ...config,
        };
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

    public addPlayer(player: Player): GamePlayer {
        const _player = new GamePlayer(player);
        this.players.push(_player);
        return _player;
    }

    public removePlayer(uuid: string): boolean {
        const player = this.players.find(p => p.player.uuid === uuid);
        if (player) {
            this.players.splice(this.players.indexOf(player), 1);
            return true;
        }
        return false;
    }

    public getPlayer(uuid: string): GamePlayer | null {
        return this.players.find(p => p.player.uuid === uuid) ?? null;
    }

    public playerExists(uuid: string): boolean {
        return this.getPlayer(uuid) !== null;
    }

    public getClientPlayers(): Array<IClientGamePlayer> {
        return this.players.map(p => {
            return {
                name: p.player.name,
                hasTurn: p.hasTurn,
                isReady: p.ready,
            }
        });
    }

    public checkPlayerLifecycles() {
        this.players.forEach(p => {
            if (Date.now() - p.lastPing > 1000 * 30) {
                this.removePlayer(p.player.uuid);
            }
        });
    }

    public arePlayersReady(): boolean {
        let ready = true;
        this.players.forEach(p => {
            ready = p.ready;
        });
        return ready;
    }

    public tryStart() {
        if (this.arePlayersReady()) {
            this.state = 'playing';
            this.players.forEach(p => {
                p.fillDeck(6);
            });
            this.players[Math.floor(Math.random() * this.players.length)].hasTurn = true;
        }
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

export { GamePlayer, Game, IClientGamePlayer, GameState, IGameConfig };