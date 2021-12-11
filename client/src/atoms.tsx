import {atom} from 'recoil';
import {ILobby, IPlayer, ICard} from './types';
import {Socket} from 'socket.io-client';

const socketState = atom<Socket | null>({
  key: 'socketState',
  default: null,
});

const screenState = atom<'' | JSX.Element>({
    key: 'screenState',
    default: '',
});

const modalContentState = atom<string | JSX.Element>({
    key: 'modalContentState',
    default: '',
});

const modalOpenState = atom<boolean>({
    key: 'modalOpenState',
    default: false,
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

export {socketState, playerState, lobbiesState, modalContentState, modalOpenState, screenState};