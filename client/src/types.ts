
type CardColor = 'red' | 'green' | 'blue' | 'yellow' | 'black' | 'none';
type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '+2' | '+4' | 'reverse' | 'skip' | 'pickColor' | 'none';
type CardState = 'deck' | 'played';

interface ICard {
    color: CardColor,
    value: CardValue,
    state: CardState,
}

interface IGamePlayer {
    name: string,
    hasTurn: boolean,
    isReady: boolean,
    place: number | null,
    deckSize: number,
}

interface IPlayer extends IGamePlayer {
    deck: Array<ICard>,
    inLobby: number | null,
    pickedUpCard: boolean,
}

interface ILobby {
    id: number,
    name: string,
    hasPassword: boolean,
    players: Array<IGamePlayer>,
    playerLimit: number,
    stack: Array<ICard>,
    state: 'waiting' | 'playing' | 'finished',
    streak: number,
    direction: 1 | -1,
}

type GameState = 'waiting' | 'playing' | 'finished';

interface IGame extends ILobby {
    stack: Array<ICard>,
    reserve: Array<ICard>,
    state: GameState,
}

interface IModalState {
    isOpen: boolean,
    content: string | JSX.Element,
    closable: boolean,
}

export type { IPlayer, ILobby, ICard, CardValue, CardColor, GameState, IGame, IModalState };