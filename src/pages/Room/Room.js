import React from 'react';
import {useParams} from "react-router";
import {LOCAL_VIDEO, useWebRTC} from "../../hooks/useWebRTC";


const Room = () => {
    const {id: roomId} = useParams();

    const {clients, provideMediaRef} = useWebRTC(roomId);

    console.log(clients);

    return (
        <div>
            {clients.map((clientId) => {
                return (
                    <div>
                        <video
                            ref={instance => {
                               provideMediaRef(clientId, instance);
                            }}
                            autoPlay
                            playsInline
                            muted={clientId === LOCAL_VIDEO}
                        />
                    </div>
                )
            })}
        </div>
    );
};

export { Room };