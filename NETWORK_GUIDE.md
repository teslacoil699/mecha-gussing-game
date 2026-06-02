# Gundam Guessing Game - Network Multiplayer Guide

## Setup

### Requirements
- Node.js 14+ (for WebSocket server)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running

#### For Single Player or Local Multiplayer (Python Server)
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000/game.html` in your browser.

#### For Network Multiplayer (Node WebSocket Server)
```bash
npm start
```
Then open `http://localhost:3000/game.html` in your browser.

---

## Game Modes

### 1. Single Player
- Play 10 rounds solo
- Challenge yourself to get the highest score
- Scores saved to local leaderboard

### 2. Local Multiplayer
- Both players on the same device
- Player 1 plays 10 rounds, then Player 2
- Turn barrier prevents peeking
- Winner is determined at the end

### 3. Network Multiplayer ⭐ (NEW)
- Play with friends on the same network
- One player creates a game and shares a room code
- Other players join with the room code
- **Real-time gameplay** - both players see the same Gundam images
- **Simultaneous turns** - players can guess at the same time
- Scores synced across devices
- Leaderboard available to both players

---

## Network Game Flow

### For Host (Player 1):
1. Click "Network Game"
2. Click "Create a Game"
3. Enter your name
4. Get a room code (e.g., "ABC123")
5. Share the code with your friend
6. Game auto-starts when friend joins
7. Take turns guessing Gundams

### For Guest (Player 2):
1. Click "Network Game"
2. Click "Join a Game"
3. Enter your name
4. Enter the room code from the host
5. Join the game
6. Both players take turns guessing

---

## Network Requirements

- All players must be on the **same local network**
- The host must share their **local network IP address** and **port 3000**
- Example: `http://192.168.1.100:3000/game.html`
- Or simply share the room code to let players connect to `localhost:3000`

---

## Troubleshooting

### "Failed to connect to game server"
- Make sure the WebSocket server is running: `npm start`
- Check that port 3000 is not blocked by a firewall
- Ensure all players are on the same network

### "Room code not found"
- Double-check the room code spelling
- The host may have closed the browser/game
- Ask the host to create a new game

### "Connection lost"
- If the host disconnects, all players are disconnected
- The game will return to the main menu
- Host can create a new game to reconnect

---

## Features

✅ Real-time WebSocket communication  
✅ Room code-based game joining  
✅ Synchronized game state across devices  
✅ Score tracking for both players  
✅ Automatic leaderboard updates  
✅ Connection status display  
✅ Error handling and recovery  

---

## Architecture

- **server.js** - Node.js WebSocket server with room management
- **game.js** - Game logic for single/local/network modes
- **game.html** - UI with screens for all game modes
- **gundams.json** - Gundam database
