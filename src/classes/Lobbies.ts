import { hash } from 'bcrypt';
import {Game} from "./Game";

class Lobby extends Game {
    public name: string;
    public id: number;
    public password: string;
    public playerLimit: number;
    public timeCreated: number;

    constructor(name: string, id: number, password: string = '', playerLimit: number = 8) {
        super();
        this.name = name;
        this.id = id;
        this.password = password;
        this.playerLimit = playerLimit;
        this.timeCreated = Date.now();
    }
}

class Lobbies {
    public lobbies: Array<Lobby>;
    public lobbyCount: number;

    constructor() {
        this.lobbies = new Array<Lobby>();
        this.lobbyCount = 0;
    }

    public async addLobby(name: string, password: string = '', playerLimit: number = 8, id?: number): Promise<Lobby> {
        const lobby = new Lobby(
            name,
            id ? id : this.lobbyCount > 0 ? (this.lobbies[this.lobbyCount].id ?? - 1) + 1 : 0,
            await hash(password, 8),
            playerLimit,
        );
        this.lobbies.push(lobby);
        this.lobbyCount++;
        return lobby;
    }

    public removeLobby(id: number): boolean {
        const lobby = this.getLobbyById(id);
        if (lobby) {
            this.lobbies.splice(this.lobbies.indexOf(lobby), 1);
            this.lobbyCount--;
            return true;
        }
        return false;
    }

    public getLobbyById(id: number): Lobby | null {
        const lobby = this.lobbies.find(lobby => lobby.id === id);
        return lobby ? lobby : null;
    }
}

export { Lobbies, Lobby };