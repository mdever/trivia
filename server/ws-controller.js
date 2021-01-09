const { BehaviorSubject } = require('rxjs');
const WebSocket = require('ws');
const url = require('url');

let instance;

function WSController(initialValue) {
    const self = this;
    
    self.nodeServerSubject = new BehaviorSubject(initialValue);
    self.nodeServerSubject.subscribe(server => {
        if (!server) return;
        server.on('upgrade', function upgrade(request, socket, head) {
            const pathname = url.parse(request.url).pathname.slice(1);

            if (self.servers[pathname]) {
                const wss = self.servers[pathname];
                wss.handleUpgrade(request, socket, head, function done(ws) {
                    wss.emit('connection', ws, request);
                })
            }
        });
    });
    
    self.servers = {};

    self.verify = () => {
        console.log('Verifying that I\'ve been initialized with initialValue = ' + self.initialValue);
    }

    self.set = (value) => {
        return self.nodeServerSubject.next(value);
    }

    self.subscribe = (subscriber) => {
        return self.nodeServerSubject.subscribe(subscriber);
    }

    self.createRoomServer = (roomCode) => {
        console.log('creating room');
        const wss = new WebSocket.Server({ noServer: true });

        self.servers[roomCode] = wss;

        wss.on('connection', (ws) => {
            console.log('Room ' + roomCode + ' has received new connection');
            ws.send("Thanks for joining room " + roomCode);
            ws.on('message', (message) => {
                console.log('received message: ' + message);
                ws.send('I heard your message: ' + message + '.');
            });
        });
    }
}

WSController.getInstance = () => {
    if (!instance) {
        instance = new WSController();
    }

    return instance;
}


module.exports = {
    WSController
}