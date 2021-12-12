import React, {useEffect, useRef, useState} from 'react';
import './App.scss';
import {io} from 'socket.io-client';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {currentLobbyState, lobbiesState, playerState, socketState, tokenState} from './atoms';
import Lobbies from "./components/Lobbies/Lobbies";
import Modal from "./components/Modal/Modal";
import {Navigate, Route, Routes, useNavigate,} from "react-router-dom";
import Game from "./components/Game/Game";
import axios from "axios";
import Login from "./components/Login/Login";
import socket from './socket';

function App() {
    const [lobbies, setLobbies] = useRecoilState(lobbiesState);
    const [token, setToken] = useRecoilState(tokenState);
    const [currentLobby, setCurrentLobby] = useRecoilState(currentLobbyState);
    const [_socket, setSocket] = useRecoilState(socketState);
    const [player, setPlayer] = useRecoilState(playerState);

    const navigate = useNavigate();


    useEffect(() => {
        (async () => {
            console.log(currentLobby);

            if (token) {
                try {
                    const response = await axios.get('/api/player', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.data.success && !response.data.existed) {
                        localStorage.setItem('token', response.data.token);
                        setToken(response.data.token);
                    } else if (!response.data.success) {
                        localStorage.setItem('token', '');
                        setToken('');
                    }
                } catch (e: any) {
                    console.log(e.message);
                }

                socket.auth = {
                    token
                };

                if (socket) {
                    console.log('SOCKET');
                    socket.off('lobbies').on('lobbies', (_lobbies: any) => {
                        setLobbies(_lobbies);
                    });

                    socket.off('error').on('error', (error) => {
                        console.log(error.msg);
                    });

                    socket.off('player_ping').on('player_ping', (payload) => {
                        //console.log('player_ping');
                        socket.emit('player_ping', {
                            msg: 'pong',
                        });
                    });

                    socket.off('lobby_ping').on('lobby_ping', (payload) => {
                        //console.log('lobby_ping');
                        if (currentLobby !== null) socket.emit('lobby_ping', payload);
                    });

                    socket.off('update_player').on('update_player', (_player) => {
                        console.log(_player);
                        setPlayer(_player);
                    });
                }
            }
        })();

    }, [setLobbies, token, currentLobby]);

    return (
        <div className="App">
            <Routes>
                <Route index element={token ? <Lobbies/> : <Login/>}/>
                {
                    lobbies?.map(lobby => <Route element={<Game lobby={lobby}/>} key={lobby.id}
                                                 path={`/lobby/${lobby.id}`}/>)
                }
                {
                    lobbies && lobbies.length <= 0 ? (
                        <Route path={'*'} element={<Navigate replace to={'/'}/>}/>
                    ) : ''
                }
            </Routes>
            <Modal/>
            <footer className={'footer'}>een v0.0.1</footer>
        </div>
    );
}

export default App;
