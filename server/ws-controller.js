const { BehaviorSubject } = require('rxjs');
const WebSocket = require('ws');

let instance;

function WSController(initialValue) {
    const self = this;
    
    self.nodeServerSubject = new BehaviorSubject(initialValue);
    self.nodeServerSubject.subscribe(server => console.log('I have received server:\n' + JSON.stringify(server)));
    
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

    self.createRoomServer = (roomId) => {
        console.log('creating room');
        const wss = new WebSocket.Server({
            server: self.nodeServerSubject.value
        });

        self.servers[roomId] = wss;

        wss.on('connection', (ws) => {
            ws.on('connection', (message) => {
                console.log('received message');
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