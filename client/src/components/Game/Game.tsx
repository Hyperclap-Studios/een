import './Game.scss';
import {ILobby} from "../../types";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {modalState, tokenState} from "../../atoms";
import {useEffect, useState, MouseEvent} from "react";
import axios from "axios";

interface IGameProps {
    lobby: ILobby,
}

export default function Game({lobby}: IGameProps) {
    const setModal = useSetRecoilState(modalState);
    const token = useRecoilValue(tokenState);

    const joinGame = async (password: string = '') => {
        try {
            const response = await axios.post(`/api/join/${lobby.id}`, {password}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(response.data);
        } catch (e: any) {
            console.log(e.message);
        }
    };

    useEffect(() => {
        (async () => {
            if (lobby.hasPassword) {
                setModal({
                    isOpen: true,
                    content: <PasswordPrompt joinGame={joinGame} />,
                    closable: false,
                })
            } else {
                await joinGame();
            }
        })();
    }, [lobby.hasPassword]);

    return (
        <div className={'game'}>
            <h1>{lobby.name}</h1>
        </div>
    );
}

interface IPasswordPromptProps {
    joinGame: (password: string) => void
}

function PasswordPrompt({joinGame}: IPasswordPromptProps) {
    const [password, setPassword] = useState('');

    const _joinGame = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        joinGame(password);
    };

    return (
        <>
            <h3>Enter Password</h3>
            <form>
                <label>
                    <span className={password === '' ? '' : 'focus'}>Password</span>
                    <input type={'password'} value={password} onChange={e => setPassword(e.target.value)} />
                </label>
                <button onClick={_joinGame}>Enter</button>
            </form>
        </>
    );
}