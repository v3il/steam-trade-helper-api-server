const io = require('socket.io');

let socketInstance = null;

const initSocket = (nodeServer) => {
    socketInstance = io.listen(nodeServer);

    socketInstance.sockets.on('connection', (socket) => {
        console.log('Connected');
    });
};

const getSocketInstance = () => socketInstance;

module.exports = {
    initSocket,
    getSocketInstance,
}