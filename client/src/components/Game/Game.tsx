import './Game.scss';
import {ILobby} from "../../types";

interface IGameProps {
    lobby: ILobby,
}

export default function Game({lobby}: IGameProps) {
    return (
        <div className={'game'}>
            <h1>{lobby.name}</h1>
        </div>
    );
}