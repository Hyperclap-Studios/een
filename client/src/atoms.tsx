import {atom} from 'recoil';
import {ILobby, IPlayer, ICard, IModalState} from './types';
import {Socket} from 'socket.io-client';

const tokenState = atom<string | null>({
    key: 'tokenState',
    default: localStorage.getItem('token'),
});

const lobbyTokenState = atom<string>({
    key: 'lobbyTokenState',
    default: localStorage.getItem('lobbyToken') || '',
});

const socketState = atom<Socket | null>({
  key: 'socketState',
  default: null,
});

const screenState = atom<'' | JSX.Element>({
    key: 'screenState',
    default: '',
});

const modalState = atom<IModalState>({
    key: 'modalState',
    default: {
        isOpen: false,
        content: '',
        closable: true,
    },
});

const lobbiesState = atom<Array<ILobby> | null>({
    key: 'lobbiesState',
    default: null,
});

const currentLobbyState = atom<number | null>({
    key: 'currentLobbyState',
    default: null,
});

const playerState = atom<IPlayer>({
    key: 'playerState',
    default: {
        name: '',
        deck: new Array<ICard>(),
        hasTurn: false,
        inLobby: null,
        isReady: false,
    },
});

export {tokenState, lobbyTokenState, socketState, currentLobbyState, playerState, lobbiesState, modalState, screenState};