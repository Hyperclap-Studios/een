import React, {useEffect} from 'react';
import './App.scss';
import {io} from 'socket.io-client';
import {useRecoilState} from 'recoil';
import {lobbiesState} from './atoms';
import Lobbies from "./components/Lobbies/Lobbies";
import Modal from "./components/Modal/Modal";
import {Route, Routes} from "react-router-dom";
import Game from "./components/Game/Game";

function App() {
    const [lobbies, setLobbies] = useRecoilState(lobbiesState);

    useEffect(() => {
        const socket = io('/');

        if (socket) {
            socket.on('lobbies', (_lobbies: any) => {
                setLobbies(_lobbies);
            });
        }
    }, [setLobbies]);

    return (
        <div className="App">
            <Routes>
                <Route index element={<Lobbies/>}/>
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
