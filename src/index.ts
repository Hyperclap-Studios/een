import {config} from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import express from 'express';
import {Server, Socket} from 'socket.io';
import {join} from 'path';
import {Lobbies} from './classes/Lobbies';
import {verify} from 'jsonwebtoken';
import {Players} from "./classes/Players";

config(); // Init Environment Variables from .env file

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server);

app.use('/', express.static(join(__dirname, '..', 'client', 'build')))

app.use(bodyParser.json());

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1] ?? '';
    if (!token || !process.env.JWT_SECRET) {
        res.status(401).json({
            message: 'No token provided.'
        });
    } else {
        try {
            res.locals.user = verify(token, process.env.JWT_SECRET);
            next();
        } catch (err) {
            res.status(401).json({
                message: 'Invalid token.'
            });
        }
    }
};

// Game Setup
const lobbies = new Lobbies();
const players = new Players();

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    //console.log(token);
    if (process.env.JWT_SECRET && verify(token, process.env.JWT_SECRET)) {
        next();
    } else {
        next(new Error('Authentication Error'));
    }
})

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

app.post('/api/lobbies', authMiddleware, async (req, res) => {
    const lobby = await lobbies.addLobby(req.body.name, req.body.password || '');
    console.log(lobby);
    res.json({
        success: true,
        lobby: {
            id: lobby.id,
            name: lobby.name,
            hasPassword: lobby.password !== '',
            players: lobby.getClientPlayers(),
            playerLimit: lobby.playerLimit,
            stack: lobby.stack,
        },
    });
    refreshLobbies();
});

app.post('/api/login', (req, res) => {
    const player = players.addPlayer(req.body.name);
    res.json({
        success: true,
        player,
        token: player.getJWT(),
    });
});

app.post('/api/join/:id', authMiddleware, async (req, res) => {
    const lobby = lobbies.getLobbyById(parseInt(req.params.id));
    if (lobby && await lobby.checkPassword(req.body.password) && !lobby.playerExists(res.locals.user.uuid)) {
        lobby.addPlayer(res.locals.user.name, res.locals.user.uuid);
        refreshLobbies();
        res.json({
            success: true,
            lobby: lobby.getClientLobby(),
        });
    } else {
        res.json({
            success: false,
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});

setInterval(() => {
    // if (lobbies.checkLifecycle()) {
    //     refreshLobbies();
    // }
}, 5000);