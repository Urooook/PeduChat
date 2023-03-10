import React, {useEffect, useState} from 'react';
import socket from "../../socket/socket";
import ACTIONS from '../../socket/actions';
import { v4 } from "uuid";
import { useNavigate } from "react-router";

const Main = () => {
    const navigate = useNavigate()

    const [rooms, updateRooms] = useState([]);

    useEffect(() => {
        socket.on(ACTIONS.SHARE_ROOMS, ({rooms = []} = {}) => {
            updateRooms(rooms);
        });
    }, []);

    return (
        <div>
            <h1>Доступные комнаты</h1>

            <ul>
                {
                    rooms.map(roomId => (
                        <li key={roomId}>
                            {roomId}
                            <button onClick={() => {
                                navigate(`/room/${roomId}`)
                            }}>Присоединиться к комнате</button>
                        </li>
                    ))
                }
            </ul>

            <button onClick={() => {
                navigate(`/room/${v4()}`)
            }}>Создать комнату</button>
        </div>
    );
};

export { Main };