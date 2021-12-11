import React, {useEffect, useRef, useState} from 'react';
import './App.scss';
import {io} from 'socket.io-client';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {lobbiesState, tokenState} from './atoms';
import Lobbies from "./components/Lobbies/Lobbies";
import Modal from "./components/Modal/Modal";
import {Route, Routes} from "react-router-dom";
import Game from "./components/Game/Game";
import axios from "axios";
import Login from "./components/Login/Login";

function App() {
    const [lobbies, setLobbies] = useRecoilState(lobbiesState);
    const token = useRecoilValue(tokenState);


    useEffect(() => {
        if (token) {
            const socket = io('/', {
                auth: {
                    token
                }
            });

            if (socket) {
                console.log('SOCKET');
                socket.on('lobbies', (_lobbies: any) => {
                    setLobbies(_lobbies);
                });

                socket.on("connect_error", (error) => {
                    console.log(error);
                });
            }
        }

    }, [setLobbies, token]);

    return (
        <div className="App">
            <Routes>
                <Route index element={token ? <Lobbies/> : <Login />}/>
                {
                    lobbies.map(lobby => <Route element={<Game lobby={lobby} />} key={lobby.id} path={`/lobby/${lobby.id}`} />)
                }
            </Routes>
            <Modal />
            <footer className={'footer'}>een v0.0.1</footer>
        </div>
    );
}

export default App;
