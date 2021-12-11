import { config } from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { join } from 'path';
import { Lobbies } from './classes/Lobbies';

config(); // Init Environment Variables from .env file

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

app.use('/', express.static(join(__dirname, '..', 'client', 'build')))

app.use(bodyParser.json());

// Game Setup
const lobbies = new Lobbies();

io.on('connection', (socket: Socket) => {
    console.log(`A new client connected.`);

    socket.on('disconnect', () => {
        console.log(`A client disconnected.`);
    });

    refreshLobbies();
})

const refreshLobbies = () => {
    io.emit('lobbies', lobbies.getClientLobbies())
};

app.post('/api/lobbies', async (req, res) => {
    const lobby = await lobbies.addLobby(req.body.name, req.body.password || '');
    console.log(lobby);
    res.json({
        success: true,
        lobby: {
            id: lobby.id,
            name: lobby.name,
            players: lobby.getClientPlayers(),
            playerLimit: lobby.playerLimit,
        },
    });
    refreshLobbies();
})

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});