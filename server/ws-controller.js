const { BehaviorSubject } = require('rxjs');
const WebSocket = require('ws');
const url = require('url');

let instance;

function PlayersJoiningState(wss) {
    const self = this;
    self.wss = wss;

    self.processEvent = (ev, sender = null) => {
        if (ev.event === 'PLAYER_JOINED') {
            wss.clients.forEach(client => {
                if (sender && sender === client)
                    return;

                client.send(JSON.stringify({event: 'PLAYER_JOINED', payload: { user: ev.payload.user }}))
            }
        }
    }
}

function GameStateMachine(wss) {
    const self = this;
    self.wss = wss;
    self.activeState = new PlayersJoiningState(wss);
}

function WSController(initialValue) {
    const self = this;
    
    self.nodeServerSubject = new BehaviorSubject(initialValue);
    self.nodeServerSubject.subscribe(server => {
        if (!server) return;
        server.on('upgrade', function upgrade(request, socket, head) {
            const pathname = url.parse(request.url).pathname.slice(1);

            if (self.servers[pathname]) {
                const wss = self.servers[pathname].wss;
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

    self.getRoom = (code) => {
        return self.servers[code];
    }

    self.createRoomServer = (roomCode) => {
        console.log('creating room');
        const wss = new WebSocket.Server({ noServer: true });

        self.servers[roomCode] = {wss, owner: null, players: [], stateMachine: new GameStateMachine(wss)};

        wss.on('connection', (ws, request) => {
            console.log('Room ' + roomCode + ' has received new connection');
            const query = url.parse(request.url).query;
            const params = {};
            query.split(';').forEach(kv => {
                kv = kv.split('=');
                params[kv[0]] = kv[1];
            });
            const userId = params.user;
            const room = self.getRoom(roomCode);

            room.players.push(userId);
            if (!room.owner) 
                room.owner = userId;

            ws.on('message', (message) => {
                wss.clients.forEach(client => {
                    client.send("message received on server: " + message);
                })
            });
            ws.send(JSON.stringify({event: 'PLAYERS_LIST', payload: { users: room.players }}));
            wss.clients.forEach(client => {
                if (client !== ws) {
                    client.send(JSON.stringify({event: 'NEW_PLAYER', payload: {user: userId}}));
                }
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