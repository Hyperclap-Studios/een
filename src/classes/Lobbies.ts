import { hash } from 'bcrypt';

interface LobbyPlayer {
    uuid: string,
    score: number,
}

class Lobby {
    public name: string;
    public id: number;
    public password: string;
    public playerLimit: number;
    public timeCreated: number;
    public players: Array<LobbyPlayer>;

    constructor(name: string, id: number, password: string = '', playerLimit: number = 8) {
        this.name = name;
        this.id = id;
        this.password = password;
        this.playerLimit = playerLimit;
        this.timeCreated = Date.now();
        this.players = new Array<LobbyPlayer>();
    }

    public addPlayer(uuid: string): LobbyPlayer {
        const player = {
            uuid,
            score: 0,
        };
        this.players.push(player);
        return player;
    }

    public removePlayer(uuid: string): boolean {
        const player = this.players.find(p => p.uuid === uuid);
        if (player) {
            this.players.splice(this.players.indexOf(player), 1);
            return true;
        }
        return false;
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