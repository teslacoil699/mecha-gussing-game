# Gundam Guessing Game 🤖

A fun interactive guessing game where you identify Gundams from Mobile Suit Gundam franchise by their images. Features single-player, local multiplayer, and **network multiplayer** modes!

---

## Features

✅ **Three Game Modes:**
- **Single Player** - Challenge yourself with 10 rounds
- **Local Multiplayer** - Play against a friend on the same device (turn-based)
- **Network Multiplayer** ⭐ NEW - Play with friends over local network in real-time!

✅ **Core Features:**
- 10+ Gundams with accurate images and data
- Real-time randomization (no repeats in session)
- Case-insensitive guess validation
- Score tracking and leaderboard (persistent via localStorage)
- Responsive sci-fi themed UI
- Turn barrier to prevent peeking in local multiplayer

---

## Quick Start

### 1. For Single Player or Local Multiplayer
```bash
python3 -m http.server 8000
```
Then open: `http://localhost:8000/game.html`

### 2. For Network Multiplayer 🌐
```bash
npm install
npm start
```
Then open: `http://localhost:3000/game.html`

**To play on different computers:**
1. Get host machine's IP: `ipconfig` or `ifconfig`
2. Guest opens: `http://<HOST_IP>:3000/game.html`
3. Host creates game, guest joins with room code

---

## Game Modes Explained

### Single Player
- Play 10 rounds solo
- See your final score
- Score saved to leaderboard
- Perfect for quick gaming sessions

### Local Multiplayer
- 2 players, same device
- Player 1 plays 10 rounds
- Turn barrier prevents peeking
- Player 2 plays 10 rounds
- Winner is determined by highest score
- Scores saved to shared leaderboard

### Network Multiplayer ⭐
- 2 players, different devices on same network
- Host creates a room, guest joins with code
- Both players see the same Gundam image
- **Real-time simultaneous gameplay**
- Scores synced across devices
- Connected via WebSocket on port 3000
- See [SETUP_NETWORK.md](SETUP_NETWORK.md) for detailed instructions

---

## File Structure

```
gundam-guessing-game/
├── index.html           # Showcase/Hub website
├── game.html            # Game interface
├── game.js              # Game logic (all modes)
├── game-style.css       # Game styling
├── server.js            # WebSocket server for network mode
├── gundams.json         # Gundam database
├── style.css            # Showcase styling
├── script.js            # Showcase logic
├── package.json         # Node dependencies
├── SETUP_NETWORK.md     # Network setup guide
└── NETWORK_GUIDE.md     # Network gameplay guide
```

---

## Guessing Rules

- Identify Gundams by their **image**
- Type the exact Gundam name
- Matching is **case-insensitive** and **whitespace-trimmed**
- Examples that match:
  - "RX-78-2 Gundam" ✓
  - "rx-78-2 gundam" ✓
  - "rx-78-2  gundam" ✓ (extra spaces OK)
- +1 point per correct guess
- 10 rounds per player/game

---

## Gundam Database

Currently includes 10+ Gundams:
- RX-78-2 Gundam (Mobile Suit Gundam)
- Wing Gundam Zero (Gundam Wing)
- Barbatos (Iron-Blooded Orphans)
- Strike Gundam (Gundam SEED)
- Unicorn Gundam (Gundam Unicorn)
- Exia (Gundam 00)
- Crossbone Gundam (Crossbone Gundam)
- Sazabi (Char's Counterattack)
- Freedom Gundam (Gundam SEED)
- Barbatos Lupus (IBO Season 2)

All images sourced from official Gundam Wiki.

---

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- No external dependencies
- Responsive design with CSS Grid/Flexbox

**Backend (Network Mode):**
- Node.js WebSocket server
- `ws` library for WebSocket protocol
- Room-based game management
- State synchronization

**Data:**
- JSON for Gundam database
- localStorage for high scores persistence

---

## Requirements

- **Single/Local**: Python 3.x (for HTTP server)
- **Network Mode**: Node.js 14+ and npm

---

## Spec Compliance

✅ **T1** - Website layout with hero, sections, footer  
✅ **T2** - Display Gundam images from JSON  
✅ **T3** - Randomize Gundams (Fisher-Yates shuffle)  
✅ **T4** - Build guessing system with validation  
✅ **T5** - Create point tracker and scoring  
✅ **T6** - Setup project files (HTML, CSS, JS)  
✅ **T7** - Save high scores to localStorage  
✅ **T8** - Local network multiplayer support 🌐

---

## Troubleshooting

### "Failed to connect to game server"
- Ensure Node.js server is running: `npm start`
- Check port 3000 is not blocked
- Verify firewall allows WebSocket connections

### "Room code not found"
- Double-check room code spelling (case-sensitive for some formats)
- Host may have disconnected; ask them to create new game

### Input disabled after guess
- Game auto-enables input on "Next" button click
- If stuck, refresh the page

### Port already in use
- Change port in `server.js` and reconnect
- Or kill existing process on port 3000

---

## Future Enhancements

- [ ] Difficulty levels (time limits, multiple choice)
- [ ] Hint system (reveal letters, silhouette)
- [ ] Series-based guessing mode
- [ ] Player statistics and profiles
- [ ] Mobile app version
- [ ] Sound effects and animations
- [ ] Multiplayer leaderboard with persistence
- [ ] Custom Gundam database upload

---

## License

MIT

---

## Credits

- Gundam images from [Gundam Wiki](https://gundam.fandom.com/)
- Game design and implementation by teslacoil699
- Made with ❤️ for Gundam fans

