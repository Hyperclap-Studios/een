import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {currentLobbyState, lobbiesState, lobbyTokenState, modalState} from "../../atoms";
import {ILobby} from "../../types";
import React, {useCallback, useEffect, useRef, useState} from "react";
import axios from 'axios';
import './Lobbies.scss';
import {useNavigate} from "react-router-dom";

export default function Lobbies() {
    const lobbies = useRecoilValue(lobbiesState);
    const [modal, setModal] = useRecoilState(modalState);
    const setCurrentLobby = useSetRecoilState(currentLobbyState);

    const openModal = () => {
        setModal({
            isOpen: true,
            content: <CreateLobby />,
            closable: true,
        });
    };

    const closeModal = useCallback(() => {
        setModal({
            ...modal,
            isOpen: false,
        });
    }, [modal]);

    useEffect(() => {
        closeModal();
        setCurrentLobby(null);
    }, []);

    return (
        <div className={'lobbies'}>
            <h1>Lobbies</h1>
            <div className={'lobbies_list'}>
                <div onClick={openModal} className={'lobby new'}>
                    <div className={'lobby_name'}>Create New Lobby</div>
                </div>
                {
                    lobbies?.map((lobby: ILobby) => {
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
    const setLobbyToken = useSetRecoilState(lobbyTokenState);
    const [modal, setModal] = useRecoilState(modalState);

    const navigate = useNavigate();

    const createLobby = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/lobbies', {
                name,
                password,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (response.data.success) {
                console.log(response.data);
                setLobbyToken(response.data.lobbyToken);
                localStorage.setItem('lobbyToken', response.data.lobbyToken);
                setName('');
                setPassword('');
                setModal({
                    ...modal,
                    isOpen: false,
                });
                navigate(`/lobby/${response.data.lobby.id}`);
            }
        } catch (e: any) {
            console.error(e.message);
        }
    };

    const inputElement = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputElement !== null && modal.isOpen) {
            inputElement.current?.focus();
        }
    }, [modal.isOpen]);

    return (
        <>
            <h3>Create Lobby</h3>
            <form>
                <label>
                    <span className={name === '' ? '' : 'focus'}>Name</span>
                    <input ref={inputElement} value={name} onChange={e => setName(e.target.value)} type={'text'} />
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