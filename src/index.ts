import { config } from 'dotenv';
import { Lobbies } from './classes/lobbies';

config(); // Init Environment Variables from .env file

const lobbies = new Lobbies();


(async () => {
    const lobby = await lobbies.addLobby('wow');

    console.log(lobbies.getLobbyById(lobby.id));
})();