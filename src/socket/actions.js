const ACTIONS = {
    JOIN: 'join',
    LEAVE: 'leave',
    SHARE_ROOMS: 'share-rooms', // Поделиться комнатами
    ADD_PEER: 'add-peer', // Для создания нового соединения между клиентами
    REMOVE_PEER: 'remove-peer', //
    RELAY_SDP: 'relay-sdp', // Для передачи sdp с медиа даннными
    RELAY_ICE: 'relay-ice', // Для передачи ice кандидатов(физические подключения)
    ICE_CANDIDATE: 'ice-candidate', // Для реагирования на кандидатов
    SESSION_DESCRIPTION: 'session-description', // Когда придет новая сессия и нам ее надо будет у себя использовать
}

module.exports = ACTIONS;