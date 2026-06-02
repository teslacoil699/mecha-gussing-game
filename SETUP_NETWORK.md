# Network Multiplayer Setup Instructions

## Quick Start for Network Game

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the WebSocket Server
```bash
npm start
```

You should see:
```
WebSocket server running on ws://localhost:3000
Serving files on http://localhost:3000
Access the game at http://localhost:3000/game.html
```

### Step 3: Open the Game
Open your browser and go to: **`http://localhost:3000/game.html`**

### Step 4: Play Over Network
- **Host**: Click "Network Game" → "Create a Game" → Share room code with friend
- **Guest**: Click "Network Game" → "Join a Game" → Enter host's room code

---

## Playing on Multiple Computers

### Same Network:
1. Host starts server: `npm start`
2. Get host's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Guest opens: `http://<HOST_IP>:3000/game.html`
4. Both follow Step 4 above

### Example:
- Host IP: `192.168.1.100`
- Guest opens: `http://192.168.1.100:3000/game.html`

---

## Modes Comparison

| Feature | Single Player | Local Multiplayer | Network |
|---------|---------------|-------------------|---------|
| Players | 1 | 2 (same device) | 2 (different devices) |
| Connection | None | None | WebSocket |
| Room Code | N/A | N/A | Required |
| Turn Barrier | N/A | Yes | Simultaneous |
| Score Sync | Local | Local | Real-time |
| Setup | Python | Python | Node.js |

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port in server.js
```

### Firewall Issues
- Allow Node.js through your firewall
- Check if port 3000 is accessible from guest machine

### WebSocket Connection Failed
- Verify server is running: `npm start`
- Check console for errors
- Ensure both machines are on same network
- Try localhost:3000 first, then add network IP

---

## Implementation Details

### Server (`server.js`)
- Manages WebSocket connections
- Creates/joins game rooms
- Syncs game state between players
- Handles disconnections gracefully

### Client (`game.js`)
- Connects to WebSocket server
- Sends/receives game messages
- Updates UI in real-time
- Maintains local game state

### Network Messages
- `createGame`: Host creates a game room
- `joinGame`: Guest joins with room code
- `submitGuess`: Player sends guess
- `roundUpdated`: State sync between players
