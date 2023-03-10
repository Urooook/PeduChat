const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const ACTIONS = require('./src/socket/actions');
const {validate, version} = require('uuid');

const PORT = process.env.PORT || 3001;

function getClientRooms() { // Список всех комнат, где могут общаться клиенты
    const {rooms} = io.sockets.adapter;

    return Array.from(rooms.keys()).filter(roomId => validate(roomId) && version(roomId) === 4);
}

function shareRoomsInfo () { // Список всех доступных комнат, куда можно подключиться
    io.emit(ACTIONS.SHARE_ROOMS, {
        rooms: getClientRooms()
    })
}

io.on('connection', socket => {
    shareRoomsInfo();

    socket.on(ACTIONS.JOIN, config => {
        const {room: roomId} = config;
        const {rooms: joinedRooms} = socket;

        if(Array.from(joinedRooms).includes(roomId)) {
            return console.warn(`Alredy joined to ${roomId}`);
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach(clientID => {
            io.to(clientID).emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: false,
            });

            socket.emit(ACTIONS.ADD_PEER, {
                peerID: clientID,
                createOffer: true,
            });
        });

        socket.join(roomId);
        shareRoomsInfo();
    });

    function leaveRoom() {
        const {rooms} = socket;

        Array.from(rooms).forEach(roomId => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])

            clients.forEach(clientId => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerID: socket.id,
                });

                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerID: clientId
                })
            })

            socket.leave(roomId);
        })
        shareRoomsInfo();
    }

    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);
})

server.listen(PORT, () => {
    console.log('Server started!');
})
