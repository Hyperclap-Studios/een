import {hash, compare} from 'bcrypt';
import {IClientGamePlayer, Game, GamePlayer, GameState, IGameConfig} from "./Game";
import {Card} from "./Card";
import {Player} from "./Players";
import {sign, verify} from "jsonwebtoken";
import {generateUUID} from "../lib/helpers";

interface IClientLobby {
    id: number,
    name: string,
    hasPassword: boolean,
    players: Array<IClientGamePlayer>,
    playerLimit: number,
    stack: Array<Card>,
    state: GameState,
}

interface IClientPlayer extends IClientGamePlayer {
    deck: Array<Card>,
    inLobby: number | null,
}

interface IJwtPayload {
    lobbyId: number,
    uuid: string,
}

class Lobby extends Game {
    public name: string;
    public id: number;
    public password: string;
    public playerLimit: number;
    public lastPing: number;
    public uuid: string;

    constructor(name: string, id: number, password: string = '', playerLimit: number = 8, config: IGameConfig = {}) {
        super(config);
        this.name = name;
        this.id = id;
        this.password = password;
        this.playerLimit = playerLimit;
        this.lastPing = Date.now();
        this.uuid = generateUUID();
    }

    public async checkPassword(password: string): Promise<boolean> {
        if (this.password === '') return true;
        return await compare(password, this.password);
    }

    public getJWT(): string {
        if (process.env.JWT_SECRET) {
            return sign({
                lobbyId: this.id,
                uuid: this.uuid,
            }, process.env.JWT_SECRET);
        }
        return '';
    }

    public validateJWT(token: string): boolean {
        if (process.env.JWT_SECRET) {
            try {
                const payload = verify(token, process.env.JWT_SECRET) as IJwtPayload;
                return payload.lobbyId === this.id && payload.uuid === this.uuid;
            } catch (e: any) {
                console.log('JWT validation error: ', e.message);
            }
        }
        return false;
    }

    public getClientLobby(): IClientLobby {
        return {
            id: this.id,
            name: this.name,
            hasPassword: this.password !== '',
            players: this.getClientPlayers(),
            playerLimit: this.playerLimit,
            stack: this.stack,
            state: this.state,
        }
    }

    public addPlayerToLobby(player: Player): GamePlayer {
        player.inLobby = this.id;
        return super.addPlayer(player);
    }

    public getClientPlayer(uuid: string): IClientPlayer | null {
        const player = this.getPlayer(uuid);
        if (player === null) return null;
        return {
            name: player.player.name,
            hasTurn: player.hasTurn,
            deck: player.deck,
            inLobby: this.id,
            isReady: player.ready,
        };
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
        //console.log(this.lobbies);
        //console.log(this.lobbyCount);
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

    public checkLifecycles(): boolean {
        let deletedLobbies = false;
        this.lobbies.forEach(lobby => {
            //console.log(lobby.players);
            if (lobby.players.length === 0 && lobby.lastPing + (20 * 1000) < Date.now()) {
                deletedLobbies = true;
                this.removeLobby(lobby.id);
                console.log('REMOVED LOBBY ' + lobby.id);
            }
        });
        return deletedLobbies;
    }
}

export {Lobbies, Lobby};