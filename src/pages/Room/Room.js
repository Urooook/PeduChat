import React from 'react';
import {useParams} from "react-router";
import {LOCAL_VIDEO, useWebRTC} from "../../hooks/useWebRTC";

function layout(clientsNumber = 1) {
    const pairs = Array.from({length: clientsNumber})
        .reduce((acc, next, index, arr) => {
            if (index % 2 === 0) {
                acc.push(arr.slice(index, index + 2));
            }

            return acc;
        }, []);

    const rowsNumber = pairs.length;
    const height = `${100 / rowsNumber}%`;

    return pairs.map((row, index, arr) => {

        if (index === arr.length - 1 && row.length === 1) {
            return [{
                width: '100%',
                height,
            }];
        }

        return row.map(() => ({
            width: '50%',
            height,
        }));
    }).flat();
}

const Room = () => {
    const {id: roomId} = useParams();

    const {clients, provideMediaRef} = useWebRTC(roomId);
    const videoLayout = layout(clients.length);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            height: '100vh',
        }}>
            {clients.map((clientId, index) => {
                return (
                    <div key={clientId} style={videoLayout[index]} id={clientId}>
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