import './Game.scss';
import {CardColor, ILobby} from "../../types";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentLobbyState, lobbyTokenState, modalState, playerState, tokenState} from "../../atoms";
import {useEffect, useState, MouseEvent, useCallback, useRef} from "react";
import axios from "axios";
import {Link} from 'react-router-dom';
import socket from '../../socket';
import Card from "../Card/Card";
import {GiClockwiseRotation, GiAnticlockwiseRotation} from 'react-icons/gi';

interface IGameProps {
    lobby: ILobby,
}

export default function Game({lobby}: IGameProps) {
    const [modal, setModal] = useRecoilState(modalState);
    const [currentLobby, setCurrentLobby] = useRecoilState(currentLobbyState);
    const [lobbyToken, setLobbyToken] = useRecoilState(lobbyTokenState);
    const token = useRecoilValue(tokenState);

    useEffect(() => {
        tryJoin().then();
    }, []);

    useEffect(() => {
        if (socket) {
            console.log('EMIT UPDATE_PLAYER');
            socket.emit('update_player', {
                lobbyId: lobby.id,
            });

            window.addEventListener('keypress', (e) => {
                if (e.key === ' ') {
                    socket.emit('say_een', {
                        lobbyId: lobby.id,
                    });
                }
            });
        }
    }, []);

    useEffect(() => {
        //console.log(lobby);
        setCurrentLobby(lobby.id);
    }, [lobby]);

    const joinGame = async (password: string = ''): Promise<any> => {
        try {
            const response = await axios.post(`/api/join/${lobby.id}`, {lobbyToken, password}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                console.log(response.data);
                setLobbyToken(response.data.lobbyToken);
                localStorage.setItem('lobbyToken', response.data.lobbyToken);
                setModal({
                    ...modal,
                    isOpen: false,
                });
            } else {
                setLobbyToken('');
                localStorage.setItem('lobbyToken', '');
                setModal({
                    isOpen: true,
                    content: <PasswordPrompt joinGame={joinGame}/>,
                    closable: false,
                });
            }
            return response.data;
        } catch (e: any) {
            console.log(e.message);
            return null;
        }
    };

    const tryJoin = useCallback(async () => {
        if (lobbyToken !== '' || !lobby.hasPassword) {
            await joinGame();
        } else {
            setModal({
                isOpen: true,
                content: <PasswordPrompt joinGame={joinGame}/>,
                closable: false,
            })
        }
    }, [lobby.hasPassword, lobbyToken]);

    const getScreen = () => {
        switch (lobby.state) {
            case 'waiting':
                return <WaitingScreen lobby={lobby}/>;
            case 'playing':
                return <PlayingScreen lobby={lobby}/>;
            case 'finished':
                return <FinishedScreen lobby={lobby}/>;
            default:
                return <div>Unknown state</div>;
        }
    };

    return (
        <>
            <Link className={'leave'} to={'/'}>Leave</Link>
            {getScreen()}
        </>
    );
}

interface IScreenProps {
    lobby: ILobby,
}

function WaitingScreen({lobby}: IScreenProps) {
    const [player, setPlayer] = useRecoilState(playerState);

    const toggleReady = () => {
        socket.emit('toggle_ready', {
            lobbyId: lobby.id,
        });
    };

    return (
        <div className={'game'}>
            <h1 className={'game_name'}>{lobby.name}</h1>
            <span className={'game_playerCount'}>{lobby.players.length} / {lobby.playerLimit} Players</span>
            <button tabIndex={-1} className={`game_readyButton ${player.isReady ? 'ready' : ''}`}
                    onClick={toggleReady}>{player.isReady ? 'Unready' : 'Ready Up'}</button>
            <div className={'game_players'}>
                {
                    lobby.players.map((player, index) => (
                        <div key={index} className={`game_player ${player.isReady ? 'ready' : ''}`}>
                            {/*<FaUserAlt className={'game_player_icon'} />*/}
                            <div className={'game_player_name'}>{player.name}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

function PlayingScreen({lobby}: IScreenProps) {
    const player = useRecoilValue(playerState);
    const [modal, setModal] = useRecoilState(modalState);

    const topCard = lobby.stack[lobby.stack.length - 1];

    const allowDrop = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const drop = (e: React.DragEvent) => {
        e.preventDefault();
        const cardIndex = parseInt(e.dataTransfer.getData('index'));
        console.log({
            cardIndex
        });
        if (player.deck[cardIndex].color === 'black') {
            setModal({
                isOpen: true,
                closable: true,
                content: <ChooseColor lobbyId={lobby.id} cardIndex={cardIndex}/>
            });
        } else {
            socket.emit('play_card', {
                lobbyId: lobby.id,
                cardIndex,
                chooseColor: 'red',
            });
        }
    };

    const pickUpCard = () => {
        socket.emit('pick_up_card', {
            lobbyId: lobby.id,
        });
    };

    const skip = () => {
        socket.emit('skip', {
            lobbyId: lobby.id,
        });
    };

    return (
        <div className={'playingScreen'}>
            {
                lobby.players.map((_player, i) => (
                    <div key={i} style={{
                        top: `${Math.sin(i / (lobby.players.length - 1) * Math.PI + Math.PI) * 45 + 50}%`,
                        left: `${Math.cos(i / (lobby.players.length - 1) * Math.PI + Math.PI) * 45 + 50}%`,
                    }}
                         className={`playingScreen_player ${_player.hasTurn ? 'hasTurn' : ''} ${_player.name === player.name ? 'isPlayer' : ''}`}>
                        <div className={'playingScreen_player_name'}>{_player.name}</div>
                        <div
                            className={'playingScreen_player_deckSize'}>{_player.place ? _player.place + '\' Place' : _player.deckSize + ' Cards'}</div>
                    </div>
                ))
            }
            <div className={'playingScreen_stack'}>
                <Card index={-1} draggable={false} onDragOver={allowDrop} onDrop={drop} value={topCard.value}
                      color={topCard.color}/>
            </div>
            <div className={'playingScreen_info'}>
                <div className={'playingScreen_info_streak'}>Current Streak: {lobby.streak}</div>
                <div className={'playingScreen_info_direction'}>{lobby.direction === 1 ? <GiClockwiseRotation/> :
                    <GiAnticlockwiseRotation/>}</div>
                <div className={'playingScreen_info_turnState'}>{player.hasTurn ? 'Your Turn' : ''}</div>
            </div>
            <div className={'playingScreen_controls'}>
                {
                    player.hasTurn ? (
                        <>
                            {
                                player.pickedUpCard ? '' : <button onClick={pickUpCard}>Pick Up Card</button>
                            }
                            <button onClick={skip}>Skip</button>
                        </>
                    ) : ''
                }
            </div>
            <div className={'playingScreen_deck'}>
                {
                    player.deck.map((card, i) => (
                        <Card draggable={true} key={i} index={i} value={card.value} color={card.color} size={'small'}/>
                    ))
                }
            </div>
        </div>
    );
}

interface IChooseColorProps {
    cardIndex: number,
    lobbyId: number,
}

function ChooseColor({cardIndex, lobbyId}: IChooseColorProps) {
    const [modal, setModal] = useRecoilState(modalState);

    const choose = (color: CardColor) => {
        socket.emit('play_card', {
            lobbyId,
            cardIndex,
            chooseColor: color,
        });
        setModal({
            ...modal,
            isOpen: false,
        });
    };

    return (
        <>
            <h3>Choose Color</h3>
            <div className={'chooseColor'}>
                <div className={'chooseColor_row'}>
                    <div onClick={() => choose('red')} className={'chooseColor_tile red'}/>
                    <div onClick={() => choose('blue')} className={'chooseColor_tile blue'}/>
                </div>
                <div className={'chooseColor_row'}>
                    <div onClick={() => choose('yellow')} className={'chooseColor_tile yellow'}/>
                    <div onClick={() => choose('green')} className={'chooseColor_tile green'}/>
                </div>
            </div>
        </>
    );
}

function FinishedScreen({lobby}: IScreenProps) {
    useEffect(() => {
        console.log(lobby);
    }, [lobby]);

    const getSortedPlayers = useCallback(() => {
        const _players = [...lobby.players];
        _players.sort((a, b) => {

            if ((a.place ? a.place : 0) < (b.place ? b.place : lobby.players.length)) return -1;
            if ((a.place ? a.place : 0) > (b.place ? b.place : lobby.players.length)) return 1;

            return 0;
        });
        return _players;
    }, [lobby]);

    return (
        <div className={'finishedScreen'}>
            <h1>Finished</h1>
            <div className={'finishedScreen_leaderboard'}>
                {
                    getSortedPlayers().map((_player, i) => (
                        <div className={'finishedScreen_leaderboard_player'}>
                            {_player.place}' Place: {_player.name}
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

interface IPasswordPromptProps {
    joinGame: (password: string) => Promise<any>
}

function PasswordPrompt({joinGame}: IPasswordPromptProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const modal = useRecoilValue(modalState);

    const inputRef = useRef<HTMLInputElement>(null);

    const _joinGame = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError('');
        const response = await joinGame(password);
        if (response.error) {
            setPassword('');
            setError(response.error);
        }
    };

    useEffect(() => {
        if (modal.isOpen) {
            setError('');
            setPassword('');
            inputRef.current?.focus();
        }
    }, [modal.isOpen]);

    return (
        <>
            <h3>Enter Password</h3>
            <form>
                <label>
                    <span className={password === '' ? '' : 'focus'}>Password</span>
                    <input ref={inputRef} type={'password'} value={password}
                           onChange={e => setPassword(e.target.value)}/>
                </label>
                <button className={error ? 'marginBottom' : ''} onClick={_joinGame}>Enter</button>
                <span className={'error'}>{error}</span>
            </form>
        </>
    );
}