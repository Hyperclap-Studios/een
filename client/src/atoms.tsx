import {atom} from 'recoil';
import {Lobby, Player, Card} from './types';
import {Socket} from 'socket.io-client';

const socketState = atom<Socket | null>({
  key: 'socketState',
  default: null,
});

const screenState = atom<'' | JSX.Element>({
    key: 'screenState',
    default: '',
});

const modalState = atom<'' | JSX.Element>({
    key: 'modalState',
    default: '',
});

const lobbiesState = atom<Array<Lobby>>({
    key: 'lobbiesState',
    default: new Array<Lobby>(),
});

const playerState = atom<Player>({
    key: 'playerState',
    default: {
        uuid: '',
        name: '',
        deck: new Array<Card>(),
    },
});

export {screenState};