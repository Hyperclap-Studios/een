import {hash, compare} from 'bcrypt';
import {IClientGamePlayer, Game} from "./Game";
import {Card} from "./Card";

interface IClientLobby {
    id: number,
    name: string,
    hasPassword: boolean,
    players: Array<IClientGamePlayer>,
    playerLimit: number,
    stack: Array<Card>,
}

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

    public async checkPassword(password: string): Promise<boolean> {
        if (this.password === '') return true;
        return await compare(password, this.password);
    }

    public getClientLobby(): IClientLobby {
        return {
            id: this.id,
            name: this.name,
            hasPassword: this.password !== '',
            players: this.getClientPlayers(),
            playerLimit: this.playerLimit,
            stack: this.stack,
        }
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
        console.log(this.lobbies);
        console.log(this.lobbyCount);
        const lobby = new Lobby(
            name,
            id ? id : this.lobbyCount > 0 ? (this.lobbies[this.lobbies.length - 1].id ?? -1) + 1 : 0,
            password === '' ? '' : await hash(password, 8),
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

    public getClientLobbies(): Array<IClientLobby> {
        return this.lobbies.map(lobby => {
            return lobby.getClientLobby();
        });
    }

    public checkLifecycle(): boolean {
        let deletedLobbies = false;
        this.lobbies.forEach(lobby => {
            if (lobby.players.length === 0 && lobby.timeCreated + (10 * 1000) < Date.now()) {
                deletedLobbies = true;
                this.removeLobby(lobby.id);
            }
        });
        return deletedLobbies;
    }
}

export {Lobbies, Lobby};