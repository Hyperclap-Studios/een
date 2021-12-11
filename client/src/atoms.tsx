import {atom} from 'recoil';
import {ILobby, IPlayer, ICard, IModalState} from './types';
import {Socket} from 'socket.io-client';

const tokenState = atom<string | null>({
    key: 'tokenState',
    default: localStorage.getItem('token'),
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

const lobbiesState = atom<Array<ILobby>>({
    key: 'lobbiesState',
    default: new Array<ILobby>(),
});

const playerState = atom<IPlayer>({
    key: 'playerState',
    default: {
        uuid: '',
        name: '',
        deck: new Array<ICard>(),
    },
});

export {tokenState, socketState, playerState, lobbiesState, modalState, screenState};