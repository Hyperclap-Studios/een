import { Card, CardColor } from './Card';
import {Player} from "./Players";

type GameState = 'waiting' | 'playing' | 'finished';

interface IClientGamePlayer {
    name: string,
    hasTurn: boolean,
    isReady: boolean,
    place: number | null,
    deckSize: number,
    pickedUpCard: boolean,
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
    public place: number | null;
    public pickedUpCard: boolean;
    public lastCardPlayed: number | false;

    constructor(player: Player) {
        this.player = player;
        this.deck = new Array<Card>();
        this.hasTurn = false;
        this.lastPing = Date.now();
        this.ready = false;
        this.place = null;
        this.pickedUpCard = false;
        this.lastCardPlayed = false;
    }

    public hasToPickUpCard(): boolean {
        return (this.lastCardPlayed !== false && Date.now() - this.lastCardPlayed > 1000 * 3 && this.deck.length === 1);
    }


    public reset() {
        this.deck = new Array<Card>();
        this.hasTurn = false;
        this.ready = false;
        this.place = null;
        this.pickedUpCard = false;
    }

    public fillDeck(amount: number) {
        for (let i = 0; i < amount; i++) {
            const card = new Card();
            card.randomize();
            this.deck.push(card);
        }
    }

    public sortDeck(): void {
        this.deck.sort((a, b) => {
            const aValue = a.getSortValue();
            const bValue = b.getSortValue();

            if (aValue > bValue) {
                return 1;
            }
            if (aValue < bValue) {
                return -1;
            }
            return 0;
        });
    }
}


class Game {
    public players: Array<GamePlayer>;
    private playingPlayers: Array<GamePlayer>;
    public state: GameState;
    public stack: Array<Card>;
    public reserve: Array<Card>;
    public streak: number;
    public config: IGameConfig;
    public places: number;
    protected direction: 1 | -1;
    private lastIndex: number;

    constructor(config: IGameConfig = {}) {
        this.config = {
            reserveSize: 100,
            deckSize: 6,
            ...config,
        };
        this.players = new Array<GamePlayer>()
        this.playingPlayers = new Array<GamePlayer>()
        this.state = 'waiting';
        this.stack = [Game.getRandomCard(false)];
        this.reserve = Game.getReserve(100);
        this.streak = 0;
        this.places = 1;
        this.direction = 1;
        this.lastIndex = 0;
    }

    public reset() {
        this.state = 'waiting';
        this.stack = [Game.getRandomCard(false)];
        this.reserve = Game.getReserve(100);
        this.streak = 0;
        this.places = 1;
        this.direction = 1;
        this.lastIndex = 0;

        this.players.forEach(player => player.reset());
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
            if (this.state === 'playing') {
                const hadTurn = player.hasTurn;
                const playerIndex = this.playingPlayers.indexOf(player);
                this.playingPlayers.splice(playerIndex, 1);
                if (hadTurn) {
                    this.lastIndex = this.direction === 1 ? (playerIndex >= this.playingPlayers.length ? 0 : playerIndex) : (playerIndex - 1 < 0 ? this.playingPlayers.length - 1 : playerIndex - 1);
                    this.nextTurn(0);
                }
            }
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

    public checkIsFinished(): boolean {
        return this.places === this.players.length;
    }

    public nextTurn(offset = 1): GamePlayer | null {
        if (this.checkIsFinished()) return null;
        const nextIndex = (this.lastIndex + this.direction * offset);
        const _nextIndex = offset === 0 ? this.lastIndex : (nextIndex <= 0 ? this.playingPlayers.length + nextIndex : nextIndex) % this.players.length;
        const nextPlayer = this.playingPlayers[_nextIndex];
        console.log(`LAST INDEX: ${this.lastIndex} - NEXT INDEX: ${_nextIndex}`);
        this.playingPlayers[this.lastIndex].hasTurn = false;
        //this.playingPlayers[this.lastIndex].pickedUpCard = false;
        nextPlayer.hasTurn = true;
        this.lastIndex = _nextIndex;
        if (nextPlayer.deck.length === 0) return this.nextTurn();
        if (!this.canContinueStreak(nextPlayer)) {
            this.pickUpStreak(nextPlayer);
        }
        if (!this.canPlay(nextPlayer.player.uuid)) {
            const reserveCard = Game.getRandomCard(true);
            nextPlayer.deck.push(reserveCard);
            nextPlayer.lastCardPlayed = false;
            nextPlayer.sortDeck();
            if (!reserveCard.canFollow(this.stack[this.stack.length - 1])) {
                return this.nextTurn();
            }
        } else {
            console.log('CAN PLAY');
        }
        return nextPlayer;
    }

    public tryMove(uuid: string, cardIndex: number, chooseColor: CardColor = 'red'): boolean {
        const player = this.getPlayer(uuid);
        console.log('TRY MOVE');
        //console.log(player);
        if (this.state === 'playing' && player && player.hasTurn && cardIndex < player.deck.length) {
            const card = player.deck[cardIndex];



            console.log(card);
            console.log(this.stack[this.stack.length - 1]);
            if (card.canFollow(this.stack[this.stack.length - 1])) {
                if (card.color === 'black') card.color = chooseColor;
                let offset = card.value === 'skip' ? (this.players.length <= 2 ? 0 : 2) : 1;
                this.streak += card.value === '+2' ? 2 : card.value === '+4' ? 4 : 0;
                console.log(`--- STREAK - ${this.streak}`);
                if (card.value === 'reverse') this.direction *= -1;
                this.stack.push(card);
                player.deck.splice(cardIndex, 1);
                if (this.canContinueStreak(player) && card.value !== this.stack[this.stack.length - 1].value) {
                    this.pickUpStreak(player);
                    player.sortDeck();
                }
                if (player.deck.length === 0) {
                    const playerIndex = this.playingPlayers.indexOf(player);
                    this.playingPlayers.splice(playerIndex, 1);
                    this.lastIndex = this.direction === 1 ? (playerIndex >= this.playingPlayers.length ? 0 : playerIndex) : (playerIndex - 1 < 0 ? this.playingPlayers.length - 1 : playerIndex - 1);
                    console.log(this.lastIndex);
                    offset = 0;
                    player.place = this.places;
                    this.places++;
                } else if (player.deck.length === 1) {
                    player.lastCardPlayed = Date.now();
                }
                const nextPlayer = this.nextTurn(offset);
                if (!nextPlayer) {
                    const lastPlayer = this.players.find(p => p.place === null);
                    if (lastPlayer) lastPlayer.place = this.places;
                    this.state = 'finished';
                }
                return true;
            }
        }
        return false;
    }

    public checkEen(): void {
        this.players.forEach(player => {
            if(player.hasToPickUpCard()) {
                player.deck.push(Game.getRandomCard(true));
                player.lastCardPlayed = false;
            }
        });
    }

    public trySkip(player: GamePlayer): boolean {
        if (!player.hasTurn) return false;
        if (this.streak !== 0) this.pickUpStreak(player);
        this.nextTurn();
        return true;
    }

    public tryPickUp(player: GamePlayer): boolean {
        if (player.pickedUpCard || !player.hasTurn) return false;
        player.deck.push(Game.getRandomCard(true));
        player.pickedUpCard = true;
        return true;
    }

    public pickUpStreak(player: GamePlayer) {
        console.log(`STREAK: ${this.streak}`);
        const cards = Game.getReserve(this.streak);
        this.streak = 0;
        player.deck = [...player.deck, ...cards];
        player.sortDeck();
        player.lastCardPlayed = false;
    }

    public canContinueStreak(player: GamePlayer) {
        if (this.streak !== 0 && player && player.hasTurn) {
            let canContinue = false;
            player.deck.forEach(card => {
                if (card.value === this.stack[this.stack.length - 1].value) canContinue = true;
            });
            return canContinue;
        }
        return false;
    }

    public canPlay(uuid: string): boolean {
        const player = this.getPlayer(uuid);
        if (player && player.hasTurn) {
            let _canPlay = false;
            player.deck.forEach(card => {
                if (card.canFollow(this.stack[this.stack.length - 1])) {
                    _canPlay = true;
                }
            });
            return _canPlay;
        }
        return false;
    }

    public getClientPlayers(): Array<IClientGamePlayer> {
        return this.players.map(p => {
            return {
                name: p.player.name,
                hasTurn: p.hasTurn,
                isReady: p.ready,
                place: p.place,
                deckSize: p.deck.length,
                pickedUpCard: p.pickedUpCard,
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
            if (!p.ready) ready = false;
        });
        return ready && this.players.length >= 2;
    }

    public tryStart(): boolean {
        if (this.arePlayersReady()) {
            this.state = 'playing';
            this.players.forEach(p => {
                p.fillDeck(6);
                p.sortDeck();
            });
            this.lastIndex = Math.floor(Math.random() * this.players.length);
            this.players[this.lastIndex].hasTurn = true;
            this.playingPlayers = [...this.players];
            if (!this.canPlay(this.players[this.lastIndex].player.uuid)) {
                this.nextTurn(0);
            }
            return true;
        }
        return false;
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