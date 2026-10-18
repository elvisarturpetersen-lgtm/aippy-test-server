const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: port });

let players = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'join_room') {
            ws.room = data.room;
            ws.playerId = data.playerId;
            players[data.playerId] = { x: 100, y: 100, room: data.room };
        }
        
        if (data.type === 'move') {
            if (players[data.playerId]) {
                players[data.playerId].x = data.x;
                players[data.playerId].y = data.y;
            }
        }

        if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: data.timestamp }));
        }

        const roomPlayers = Object.values(players).filter(p => p.room === ws.room);
        const stateMsg = JSON.stringify({ type: 'state', players: roomPlayers });
        
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.room === ws.room) {
                client.send(stateMsg);
            }
        });
    });
});

console.log("Server läuft auf Port " + port);