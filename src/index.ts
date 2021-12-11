import { config } from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import express from 'express';
import { Server, Socket } from 'socket.io';
import { join } from 'path';

config(); // Init Environment Variables from .env file

const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use('/', express.static(join(__dirname, '..', 'client', 'build')))
app.use(cors());
app.use(bodyParser.json());

io.on('connection', (socket: Socket) => {
    socket.send('Hello World');
})

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});