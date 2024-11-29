'use strict';

const jwt = require('jsonwebtoken');
const config = require('./node_config');

module.exports = function (io) {
    // JWT 인증 미들웨어 추가
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            socket.auth = false;
            return next();
        }

        try {
            const decoded = jwt.verify(token, config.UsertokenSecret);
            socket.user = decoded; // 검증된 사용자 정보를 소켓에 저장
            socket.auth = true;
            next();
        } catch (error) {
            socket.auth = false;
            next()
        }
    });

    io.on('connection', function (socket) {
        var address = socket.handshake.address;
        var ip;
        var time = socket.handshake.time;
        ip = address.split(':');

        console.log('New connection from ' + ip[3] + ' id: ' + socket.id + ' ' + time);
        socket.broadcast.emit('statusCheck', socket.id);
        require('../app/controllers/socketio.controller')(io, socket);
    });
}