var io = require('socket.io-client');
export const socket = io.connect('http://stream-board-subscriptions-socket-server:5000', {reconnect: true});

