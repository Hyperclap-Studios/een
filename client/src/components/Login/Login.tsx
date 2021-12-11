import React, {useEffect, useRef, useState} from "react";
import {useSetRecoilState} from "recoil";
import {tokenState} from "../../atoms";
import axios from "axios";
import './Login.scss';


export default function Login() {
    const [username, setUsername] = useState('');
    const setToken = useSetRecoilState(tokenState);

    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        input.current?.focus();
    }, []);

    const login = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/login', {name: username});

            if (response.data.success) {
                console.log(response.data);
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
            }
        } catch (e: any) {
            console.log(e.message);
        }
    };

    return (
        <div className={'login'}>
            <h1>Enter A Username</h1>
            <form>
                <label>
                    <span className={username !== '' ? 'focus' : ''}>Username</span>
                    <input ref={input} value={username} onChange={e => setUsername(e.target.value)} type={'text'} />
                </label>
                <button onClick={login}>Enter</button>
            </form>
        </div>
    );
}