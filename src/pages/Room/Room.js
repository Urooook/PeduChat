import React from 'react';
import {useParams} from "react-router";
import {LOCAL_VIDEO, useWebRTC} from "../../hooks/useWebRTC";
import Video from "./Video";

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
                width: '800px',
                height,
            }];
        }

        return row.map(() => ({
            width: '300px',
            height,
        }));
    }).flat();
}

const Room = () => {
    const {id: roomId} = useParams();

    const {clients, provideMediaRef, updateClients} = useWebRTC(roomId);
    const videoLayout = layout(clients.length);
    console.log(clients)
    // const update = clients.map((el) => {
    //     if(el.id === LOCAL_VIDEO){
    //         return { ...el, view: 'TORUS'}
    //     }
    //     return el;
    // });
    // updateClients(update, () => {})
    // console.log('clients', clients)
    // console.log(123)
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            height: '100vh',
        }} >
            {clients.map((clientId, index) => {
                return (
                    <div key={clientId} style={videoLayout[index]} id={clientId}>
                        <Video clientId={clientId} provideMediaRef={provideMediaRef} />
                    </div>
                )
            })}
        </div>
    );
};

export { Room };