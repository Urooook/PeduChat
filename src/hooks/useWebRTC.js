import {useStateWithCallback} from "./useStateWithCallback";
import {useCallback, useEffect, useRef} from "react";
import socket from "../socket/socket";
import ACTIONS from '../socket/actions';
import freeice from 'freeice';

export const LOCAL_VIDEO = 'LOCAL_VIDEO';

export function useWebRTC(roomId) {
    const [clients, updateClients] = useStateWithCallback([]);

   /* const addNewClient = useCallback((newClient, cb) => {
        if(!clients.includes(newClient)) {
            updateClients(list => [...list, newClient], cb);
        }
    }, [clients, updateClients])*/

    const addNewClient =  useCallback( (newClient, cb) => {
        updateClients(list => {
            if (!list.includes(newClient)) {
                return [...list, newClient]
            }

            return list;
        }, cb);
    }, [clients, updateClients]);

    const peerConnections = useRef({});
    const localMediaStream = useRef(null);
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });

    // console.log('peerConnections', peerConnections)

    useEffect(() => {
        async function setRemoteMedia({peerID, sessionDescription: remoteDescription}) {
            console.log(5555555555, peerID)
            console.log(remoteDescription.type === 'offer')
            // console.log('remoteDescription',remoteDescription)
            console.log('peerConnections.current[peerID]', peerConnections.current[peerID])
            await peerConnections.current[peerID]?.setRemoteDescription(
                new RTCSessionDescription(remoteDescription)
            );
            console.log('KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK')
            if(remoteDescription.type === 'offer') {
                console.log(6666)
                const answer = await peerConnections.current[peerID].createAnswer();

                await peerConnections.current[peerID].setLocalDescription(answer);
                // console.log('HHHHHHHHHHH', peerConnections.current)
                socket.emit(ACTIONS.RELAY_SDP, {
                    peerId: peerID,
                    sessionDescription: answer,
                })
            }
        }

        socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);

        return () => {
            socket.off(ACTIONS.SESSION_DESCRIPTION);
        }
    }, []);

    useEffect(() => {
        socket.on(ACTIONS.REMOVE_PEER, ({peerID}) => {
            if(peerConnections.current[peerID]) {
                peerConnections.current[peerID].close();
            }

            delete peerConnections.current[peerID];
            delete peerMediaElements.current[peerID];

            updateClients(list => list.filter(c => c !== peerID));
        });

        return () => {
            socket.off(ACTIONS.REMOVE_PEER);
        }
    }, []);

    useEffect(() => {
        socket.on(ACTIONS.ICE_CANDIDATE, ({peerID, iceCandidate}) => {
            peerConnections.current[peerID].addIceCandidate(
                new RTCIceCandidate(iceCandidate)
            );
        });
    }, [])
    // console.log(peerMediaElements)
    useEffect(() => {
        async function handleNewPeer({peerID, createOffer}) {
            // if (peerID in peerConnections.current) {
            //     return console.warn(`Already connected to peer ${peerID}`);
            // }

            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers: freeice(),
            });
            // console.log(peerConnections.current[peerID])
            peerConnections.current[peerID].onicecandidate = event => {
                if (event.candidate) {
                    socket.emit(ACTIONS.RELAY_ICE, {
                        peerId: peerID,
                        iceCandidate: event.candidate,
                    });
                }
            }
            // peerConnections.current[peerID].ontrack =() => console.log(228)

            // console.log(peerID === LOCAL_VIDEO)


            // addNewClient(peerID, () => {
            //     console.log(!!peerMediaElements.current[peerID])
            //     if (peerMediaElements.current[peerID]) {
            //         peerMediaElements.current[peerID].srcObject = localMediaStream.current;
            //     }
            // });

                let tracksNumber = 0;
            peerConnections.current[peerID].ontrack =  ({streams: [remoteStream]}) => {
                tracksNumber++
                console.log(99999999, remoteStream)
                if (tracksNumber === 2) { // video & audio tracks received
                    tracksNumber = 0;
                    addNewClient(peerID, () => {
                        console.log('Пизда', remoteStream)
                        if (peerMediaElements.current[peerID]) {
                            peerMediaElements.current[peerID].srcObject = remoteStream;
                            console.log('gagagagagagagagag',peerMediaElements.current[peerID].srcObject)
                            // console.log('gagagagagagagagag',peerMediaElements.current[LOCAL_VIDEO])

                        } else {
                            // FIX LONG RENDER IN CASE OF MANY CLIENTS
                            let settled = false;
                            const interval = setInterval(() => {
                                if (peerMediaElements.current[peerID]) {
                                    peerMediaElements.current[peerID].srcObject = remoteStream;
                                    settled = true;
                                }

                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 1000);
                        }
                    });
                } else {
                    console.log(321)
                }
            }

            localMediaStream.current.getTracks().forEach(track => {
                // console.log(14)
                peerConnections.current[peerID].addTrack(track, localMediaStream.current);
            });
            console.log(peerConnections.current[peerID])

            if (createOffer) {
                console.log('peerID', peerID)

                const offer = await peerConnections.current[peerID].createOffer();

                await peerConnections.current[peerID].setLocalDescription(offer);

                socket.emit(ACTIONS.RELAY_SDP, {
                    peerId: peerID,
                    sessionDescription: offer,
                });
            }
        }

        socket.on(ACTIONS.ADD_PEER, handleNewPeer);

        return () => {
            socket.off(ACTIONS.ADD_PEER);
        }
    }, []);

    useEffect(() => {
        async function startCapture() {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video:  {
                    width: 1280,
                    height: 720,
                }
            });

            addNewClient(LOCAL_VIDEO, () => {
                const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];

                if(localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }
            });
            // console.log('clients', clients)
        }

        startCapture()
            .then(() => socket.emit(ACTIONS.JOIN, {room: roomId}))
            .catch(e => console.error('Error getting userMedia:', e));

        return () => {
            if(localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => track.stop());

                socket.emit(ACTIONS.LEAVE);
            }
        }
    }, [roomId])

    useEffect(() => {
        console.log('PEERMEDIA', peerMediaElements.current)
    }, [peerMediaElements.current])

    const provideMediaRef = useCallback((id, node) => {
        // console.log(`peerMediaElements.current[id] ${id}`, peerMediaElements.current[id]);
        // node(peerMediaElements.current[id])
        peerMediaElements.current[id] = node;
        console.log(`peerMediaElements.current[id] `, peerMediaElements.current);

    }, [])

    return {clients, provideMediaRef};
}