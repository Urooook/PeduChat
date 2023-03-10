import {useStateWithCallback} from "./useStateWithCallback";
import {useCallback, useEffect, useRef} from "react";
import socket from "../socket/socket";
import ACTIONS from '../socket/actions';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export function useWebRTC(roomId) {
    const [clients, updateClients] = useStateWithCallback([]);

    const addNewClient = useCallback((newClient, cb) => {
        if(!clients.includes(newClient)) {
            updateClients(list => [...list, newClient], cb);
        }
    }, [clients, updateClients])

    const peerConnections = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });

    useEffect(() => {
        async function startCapture() {
            console.log(navigator)
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });

            addNewClient(LOCAL_VIDEO, () => {
                const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];

                if(localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            });
        }

        startCapture()
            .then(() => socket.emit(ACTIONS.JOIN, {room: roomId}))
            .catch(e => console.error('Error getting userMedia:', e));

        return () => {
            localMediaStream.current.getTracks().forEach(track => track.stop());

            socket.emit(ACTIONS.LEAVE);
        }
    }, [roomId])

    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node;
    }, [])

    return {clients, provideMediaRef};
}