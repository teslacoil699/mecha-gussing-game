// WebSocket Server for Network Multiplayer
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const server = http.createServer((req, res) => {
    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const wss = new WebSocket.Server({ server });

// Store active games and players
const games = new Map(); // roomCode -> { host, guest, state, etc }
const players = new Map(); // ws -> { playerId, roomCode, playerName }

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

wss.on('connection', (ws) => {
    console.log('New player connected');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        const player = players.get(ws);
        if (player) {
            const game = games.get(player.roomCode);
            if (game) {
                // Notify other player
                if (game.host && game.host !== ws) {
                    game.host.send(JSON.stringify({
                        type: 'playerDisconnected',
                        message: 'Your opponent has disconnected'
                    }));
                }
                if (game.guest && game.guest !== ws) {
                    game.guest.send(JSON.stringify({
                        type: 'playerDisconnected',
                        message: 'Your opponent has disconnected'
                    }));
                }
                games.delete(player.roomCode);
            }
            players.delete(ws);
        }
        console.log('Player disconnected');
    });
});

function handleMessage(ws, message) {
    switch (message.type) {
        case 'createGame':
            handleCreateGame(ws, message);
            break;
        case 'joinGame':
            handleJoinGame(ws, message);
            break;
        case 'startGame':
            handleStartGame(ws, message);
            break;
        case 'submitGuess':
            handleSubmitGuess(ws, message);
            break;
        case 'nextRound':
            handleNextRound(ws, message);
            break;
        case 'playAgain':
            handlePlayAgain(ws, message);
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
}

function handleCreateGame(ws, message) {
    const roomCode = generateRoomCode();
    const game = {
        roomCode,
        host: ws,
        guest: null,
        hostName: message.playerName,
        guestName: null,
        started: false,
        gameState: null
    };

    games.set(roomCode, game);
    players.set(ws, { playerId: 'host', roomCode, playerName: message.playerName });

    ws.send(JSON.stringify({
        type: 'gameCreated',
        roomCode,
        message: `Game created! Room code: ${roomCode}`
    }));

    console.log(`Game created: ${roomCode}`);
}

function handleJoinGame(ws, message) {
    const { roomCode, playerName } = message;
    const game = games.get(roomCode);

    if (!game) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room code not found'
        }));
        return;
    }

    if (game.guest !== null) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room is full'
        }));
        return;
    }

    game.guest = ws;
    game.guestName = playerName;
    players.set(ws, { playerId: 'guest', roomCode, playerName });

    // Notify both players
    game.host.send(JSON.stringify({
        type: 'playerJoined',
        guestName: playerName,
        message: `${playerName} has joined the game!`
    }));

    ws.send(JSON.stringify({
        type: 'gameJoined',
        hostName: game.hostName,
        message: `Connected to ${game.hostName}'s game`
    }));

    console.log(`Player joined game: ${roomCode}`);
}

function handleStartGame(ws, message) {
    const player = players.get(ws);
    if (!player) return;

    const game = games.get(player.roomCode);
    if (!game) return;

    // Only host can start
    if (game.host !== ws) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Only the host can start the game'
        }));
        return;
    }

    game.started = true;
    game.gameState = message.gameState;

    // Send game start to both players
    const startMessage = {
        type: 'gameStarted',
        gameState: message.gameState
    };

    game.host.send(JSON.stringify(startMessage));
    if (game.guest) {
        game.guest.send(JSON.stringify(startMessage));
    }

    console.log(`Game started: ${player.roomCode}`);
}

function handleSubmitGuess(ws, message) {
    const player = players.get(ws);
    if (!player) return;

    const game = games.get(player.roomCode);
    if (!game) return;

    // Send guess to other player
    const otherPlayer = game.host === ws ? game.guest : game.host;
    if (otherPlayer) {
        otherPlayer.send(JSON.stringify({
            type: 'opponentGuessed',
            playerId: player.playerId,
            guess: message.guess,
            isCorrect: message.isCorrect,
            correctAnswer: message.correctAnswer
        }));
    }
}

function handleNextRound(ws, message) {
    const player = players.get(ws);
    if (!player) return;

    const game = games.get(player.roomCode);
    if (!game) return;

    // Sync game state with other player
    const otherPlayer = game.host === ws ? game.guest : game.host;
    if (otherPlayer) {
        otherPlayer.send(JSON.stringify({
            type: 'roundUpdated',
            gameState: message.gameState
        }));
    }
}

function handlePlayAgain(ws, message) {
    const player = players.get(ws);
    if (!player) return;

    const game = games.get(player.roomCode);
    if (!game) return;

    // Reset scores
    game.gameState = message.gameState;

    // Notify both players
    const resetMessage = {
        type: 'gameReset',
        gameState: message.gameState
    };

    game.host.send(JSON.stringify(resetMessage));
    if (game.guest) {
        game.guest.send(JSON.stringify(resetMessage));
    }
}

server.listen(PORT, () => {
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
    console.log(`Serving files on http://localhost:${PORT}`);
    console.log('\nAccess the game at http://localhost:' + PORT + '/game.html');
});
