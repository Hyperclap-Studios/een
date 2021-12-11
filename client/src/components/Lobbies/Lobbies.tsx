import {useRecoilValue, useSetRecoilState} from "recoil";
import {lobbiesState, modalContentState, modalOpenState} from "../../atoms";
import {ILobby} from "../../types";
import React, {useState} from "react";
import axios from 'axios';
import './Lobbies.scss';

export default function Lobbies() {
    const lobbies = useRecoilValue(lobbiesState);
    const setModalContent = useSetRecoilState(modalContentState);
    const setModalOpen = useSetRecoilState(modalOpenState);

    const openModal = () => {
        setModalContent(<CreateLobby />);
        setModalOpen(true);
    };

    return (
        <div className={'lobbies'}>
            <h1>Lobbies</h1>
            <div className={'lobbies_list'}>
                <div onClick={openModal} className={'lobby new'}>
                    <div className={'lobby_name'}>Create New Lobby</div>
                </div>
                {
                    lobbies.map((lobby: ILobby) => {
                        return (
                            <Lobby key={lobby.id} lobby={lobby}/>
                        );
                    })
                }
            </div>
        </div>
    );
}

interface ILobbyProps {
    lobby: ILobby,
}

function Lobby({lobby}: ILobbyProps) {
    return (
        <a href={`#/lobby/${lobby.id}`} className={'lobby'}>
            <div className={'lobby_name'}>{lobby.name}</div>
            <div className={'lobby_playerCount'}>{lobby.players.length} / {lobby.playerLimit}</div>
        </a>
    );
}

function CreateLobby() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const setModalOpen = useSetRecoilState(modalOpenState);

    const createLobby = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/lobbies', {
                name,
                password,
            });
            if (response.data.success) {
                console.log(response.data);
                setName('');
                setPassword('');
                setModalOpen(false);
            }
        } catch (e: any) {
            console.error(e.message);
        }
    };

    return (
        <>
            <h3>Create Lobby</h3>
            <form>
                <label>
                    <span className={name === '' ? '' : 'focus'}>Name</span>
                    <input value={name} onChange={e => setName(e.target.value)} type={'text'} />
                </label>
                <label>
                    <span className={password === '' ? '' : 'focus'}>Password</span>
                    <input value={password} onChange={e => setPassword(e.target.value)} type={'password'} />
                </label>
                <button onClick={e => createLobby(e)}>Create</button>
            </form>
        </>
    );
}