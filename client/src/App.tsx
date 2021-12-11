import React, {useEffect} from 'react';
import './App.scss';
import {io} from 'socket.io-client';
import Card from './components/Card/Card';

function App() {
    useEffect(() => {
        const socket = io('/');

        console.log(socket);
    }, []);

    return (
        <div className="App">
            <Card color={'blue'} value={'skip'}/>
        </div>
    );
}

export default App;
