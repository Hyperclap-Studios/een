
type CardColor = 'red' | 'green' | 'blue' | 'yellow' | 'black' | 'none';
type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '+2' | '+4' | 'reverse' | 'skip' | 'pickColor' | 'none';

interface Card {
    color: CardColor,
    value: CardValue,
}

interface GamePlayer {
    name: string,
    hasTurn: boolean,
}

interface Player {
    uuid: string,
    name: '',
    deck: Array<Card>,
}

interface Lobby {
    id: number,
    name: string,
    players: Array<GamePlayer>,
}

type GameState = 'waiting' | 'playing' | 'finished';

interface Game extends Lobby {
    stack: Array<Card>,
    reserve: Array<Card>,
    state: GameState,
}

export type { Player, Lobby, Card, CardValue, CardColor, GameState, Game };