import {config} from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import express from 'express';
import {Server, Socket} from 'socket.io';
import {join} from 'path';
import {Lobbies} from './classes/Lobbies';
import {JwtPayload, verify} from 'jsonwebtoken';
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
    let payload: null | string | JwtPayload = null;
    if (process.env.JWT_SECRET) payload = verify(token, process.env.JWT_SECRET);
    if (payload) {
        socket.data = payload;
        next();
    } else {
        next(new Error('Authentication Error'));
    }
})

io.on('connection', (socket: Socket) => {
    console.log(`${socket.data.name} connected.`);

    const player = players.getPlayer(socket.data.uuid);
    if (player) {
        player.lastPing = Date.now();
        player.socketId = socket.id;
    }

    socket.on('lobby_ping', (payload) => {
        if (player && payload.lobbyId === player.inLobby) {
            const lobby = lobbies.getLobbyById(payload.lobbyId);
            const lobbyPlayer = lobby?.getPlayer(socket.data.uuid);
            if (lobby && lobbyPlayer) {
                lobbyPlayer.lastPing = Date.now();
                lobby.lastPing = Date.now();
            }
            //console.log(new Date() + ' - LOBBY PONG');
        }
    });

    socket.on('player_ping', (payload) => {
       if (player && payload.msg === 'pong') {
           player.lastPing = Date.now();
           //console.log(new Date() + ' - PLAYER PONG');
       }
    });

    socket.on('disconnect', () => {
        console.log(`${socket.data.name} disconnected.`);
    });

    socket.on('toggle_ready', (payload) => {
        console.log('TOGGLE_READY');
        const lobby = lobbies.getLobbyById(payload.lobbyId);
        const player = lobby?.getPlayer(socket.data.uuid);
        if (player) {
            player.ready = !player.ready;
            lobby?.tryStart();
            io.to(player.player.socketId).emit('update_player', lobby?.getClientPlayer(socket.data.uuid));
        }
        refreshLobbies();
    });

    socket.on('update_player', (payload) => {
        console.log('UPDATE_PLAYER');
        const lobby = lobbies.getLobbyById(payload.lobbyId);
        const player = lobby?.getPlayer(socket.data.uuid);
        if (player) {
            io.to(player.player.socketId).emit('update_player', lobby?.getClientPlayer(socket.data.uuid));
        }
    });

    refreshLobbies();
})

const refreshLobbies = () => {
    io.emit('lobbies', lobbies.getClientLobbies())
};

app.post('/api/lobbies', authMiddleware, async (req, res) => {
    const lobby = await lobbies.addLobby(req.body.name, req.body.password || '');
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
        lobbyToken: lobby.getJWT(),
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

app.get('/api/player', authMiddleware, (_req, res) => {
    const exists = players.existsPlayer(res.locals.user.uuid);
    const player = exists ? players.getPlayer(res.locals.user.uuid) : players.addPlayer(res.locals.user.name);
    res.json({
        success: true,
        player,
        token: player?.getJWT(),
        existed: exists,
    });
});

app.post('/api/join/:id', authMiddleware, async (req, res) => {
    const lobby = lobbies.getLobbyById(parseInt(req.params.id));
    const player = players.getPlayer(res.locals.user.uuid);
    if (lobby && player && (lobby.validateJWT(req.body.lobbyToken) || await lobby.checkPassword(req.body.password))) {
        if (!lobby.playerExists(res.locals.user.uuid)) lobby.addPlayerToLobby(player);
        refreshLobbies();
        res.json({
            success: true,
            lobby: lobby.getClientLobby(),
            player: lobby.getClientPlayer(res.locals.user.uuid),
            lobbyToken: lobby.getJWT(),
        });
    } else {
        res.json({
            success: false,
            error: 'Incorrect Password.'
        });
    }
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});

setInterval(() => {

    lobbies.lobbies.forEach(lobby => {
        lobby.players.forEach(player => {
            io.to(player.player.socketId).emit('lobby_ping', {
                lobbyId: lobby.id,
            });
        });
        lobby.checkPlayerLifecycles();
    });

    io.emit('player_ping', {
        msg: 'ping',
    });

    players.checkLifecycles();

    lobbies.checkLifecycles();

    refreshLobbies();
}, 2000);