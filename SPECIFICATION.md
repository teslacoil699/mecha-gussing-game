# Gundam Guessing Game - Technical Specification

## **Overview**

The Gundam Guessing Game is a browser-based interactive game where players identify iconic mobile suits (Gundams) from the Gundam franchise based on displayed images. The game supports three distinct play modes: Single Player, Local Multiplayer (same device), and Network Multiplayer (over WebSocket). Players earn points for correct identifications across 10 rounds, with results tracked and high scores stored locally.

---

## **Core Game Features**

### **1. Game Modes**

| Mode | Players | Description |
| :---- | :---- | :---- |
| Single Player | 1 | Player completes 10 rounds solo and sees their final score |
| Local Multiplayer | 2 | Both players share the same device; turn barriers prevent screen peeking |
| Network Game | 2 | Players connect via WebSocket using room codes; play simultaneously across different devices |

### **2. Game Mechanics**

- **Rounds**: Each game consists of 10 rounds
- **Stimulus**: Each round displays a random Gundam image from the dataset
- **Player Input**: Players type the name of the Gundam they see
- **Validation**: Guesses are normalized (lowercase, trimmed, extra spaces removed) and compared to the correct answer
- **Scoring**: 1 point awarded for each correct answer; no penalty for incorrect guesses
- **Progression**: After each guess, players proceed to the next round or see end-game results

### **3. Multiplayer Features**

**Local Multiplayer:**
- Turn barrier screen prevents the waiting player from seeing the current player's screen
- Each player completes 10 rounds sequentially
- Final results compare both players' scores and determine a winner
- Tie outcomes are explicitly shown

**Network Multiplayer:**
- Players create or join games using a 6-character room code (e.g., ABC123)
- WebSocket connection maintained at `ws://hostname:3000`
- Both players receive the same Gundam in each round and submit guesses independently
- Real-time feedback on correct/incorrect answers
- Connection status displayed with disconnect notifications
- High scores saved for both players upon game completion

---

## **Data Architecture**

### **Data Sources and Storage**

| Data | Source | Storage |
| :---- | :---- | :---- |
| Gundam Database (10 mechas) | `gundams.json` | In-memory on page load |
| Gundam Images | External URLs (wikia CDN) | Lazy-loaded on demand |
| Current Game Gundam | Random selection from pool | In-memory state (`gameState.currentGundam`) |
| Player Names | User input (max 20 chars) | In-memory state |
| Player Scores | Calculation (correct guesses) | In-memory state; saved to localStorage on game end |
| High Scores | Calculation (end-game scores) | Browser `localStorage` with player name as key |
| Room Codes | Server-generated (6 chars) | Server memory during active game |
| Network Messages | WebSocket protocol | Real-time transmission |

### **Gundam Dataset Structure**

```json
{
  "gundams": [
    {
      "id": 1,
      "name": "RX-78-2 Gundam",
      "series": "Mobile Suit Gundam",
      "year": 1979,
      "pilot": "Amuro Ray",
      "description": "The legendary mobile suit that started it all",
      "image": "https://..."
    },
    // ... 9 more entries
  ]
}
```

### **Game State Object**

```javascript
{
  currentScreen: 'modeSelect' | 'setup' | 'playing' | 'turnBarrier' | 'results' | 'networkSelect' | 'createGame' | 'joinGame' | 'networkPlaying' | 'waitingPlayer',
  gameMode: 'singlePlayer' | 'localMultiplayer' | 'networkGame',
  networkMode: 'host' | 'guest' | null,
  roomCode: 'ABC123' | null,
  currentPlayer: 'P1' | 'P2',
  players: {
    P1: { name: string, score: number, currentRound: number },
    P2: { name: string, score: number, currentRound: number }
  },
  currentGundam: { id, name, series, year, pilot, description, image },
  gundamsPool: [gundam, ...], // Shuffled array of remaining Gundams
  totalRounds: 10,
  hasGuessed: boolean
}
```

---

## **User Interface Screens**

### **Screen 1: Mode Selection**
- **Purpose**: Initial screen where players choose how to play
- **Elements**: Three buttons (Single Player, Local Multiplayer, Network Game)
- **Navigation**: Routes to either setup screen (SP/LM) or network selection (NG)

### **Screen 2: Setup / Name Entry**
- **Purpose**: Collect player name(s)
- **Elements**: 
  - Single Player: One text input for player name
  - Local Multiplayer: Two text inputs for both player names
- **Validation**: Names required, max 20 characters
- **Navigation**: Routes to playing screen upon submission

### **Screen 3: Playing**
- **Purpose**: Main gameplay screen
- **Elements**:
  - Gundam image (centered)
  - Player name and round counter (e.g., "Player 1, Round 3 of 10")
  - Score display for both players (P1 and P2)
  - Text input for guess submission
  - Feedback area (hidden until guess submitted)
- **Feedback Display**: Shows "✅ Correct!" or "❌ Incorrect" with correct answer if wrong
- **Navigation**: Next button routes to turn barrier (multiplayer) or next round (single player)

### **Screen 4: Turn Barrier** *(Local Multiplayer Only)*
- **Purpose**: Privacy screen between players' turns
- **Elements**: Message indicating whose turn it is (e.g., "Player 2's Turn") with prompt to step away
- **Navigation**: "I'm Ready to Play" button shows next player's first round

### **Screen 5: Network Selection**
- **Purpose**: Choose to create or join a network game
- **Elements**: Two buttons (Create Game, Join Game)
- **Navigation**: Routes to create-game or join-game screen

### **Screen 6: Create Game**
- **Purpose**: Host player enters their name and creates a room
- **Elements**: Name input, room code display after creation
- **Navigation**: Routes to waiting-for-player screen upon submission

### **Screen 7: Waiting for Player**
- **Purpose**: Host player waits for a guest to join
- **Elements**: Displayed room code, cancel button
- **Navigation**: Routes to network-playing screen when guest joins

### **Screen 8: Join Game**
- **Purpose**: Guest player enters name and room code
- **Elements**: Name input, room code input (uppercase)
- **Navigation**: Routes to network-playing screen upon valid code entry

### **Screen 9: Network Playing**
- **Purpose**: Real-time multiplayer game across network
- **Elements**:
  - Current player indicator and connection status
  - Gundam image
  - Guess input and submit button
  - Feedback area with correct answer
  - Next button for turn progression
- **Connection**: WebSocket displays "Connected" or error status

### **Screen 10: Results / Leaderboard**
- **Purpose**: Display final scores and determine winner
- **Elements**:
  - Both players' names and scores
  - Winner badge (or "Tie" for equal scores)
  - Single Player mode shows "Final Score" instead of winner
  - Play Again button
- **Navigation**: Play Again button resets game state and returns to mode selection

---

## **Technical Architecture**

### **Frontend Technologies**
- **HTML5**: Semantic structure with section-based screen management
- **CSS3**: Flexbox layouts, responsive design, animations
- **JavaScript (Vanilla)**: Event-driven state management, WebSocket client logic
- **Storage**: Browser `localStorage` for high score persistence

### **Backend Technologies**
- **Node.js**: HTTP and WebSocket server
- **WebSocket (ws library)**: Real-time bidirectional communication
- **HTTP Server**: Serves static files (HTML, CSS, JS, JSON, images)

### **File Structure**
```
/
├── index.html           (Home/hub page with Gundam gallery)
├── game.html            (Main game interface with all screens)
├── game.js              (Game logic, event handlers, WebSocket client)
├── game-style.css       (Game-specific styling)
├── style.css            (Global and hub page styling)
├── gundams.json         (Gundam dataset)
├── server.js            (WebSocket server for network multiplayer)
├── script.js            (Hub page interactivity)
└── docs/
    ├── spec.md          (Technical specification)
    └── wireframe.md     (UI wireframe reference)
```

### **WebSocket Protocol**

**Server Events:**
- `createGame`: Host creates a room and waits for guest
- `joinGame`: Guest joins room with code
- `guess`: Player submits their guess for the round
- `playerDisconnected`: Notify remaining player of disconnection

**Message Structure:**
```javascript
{
  type: 'createGame' | 'joinGame' | 'guess' | 'playerDisconnected',
  data: { /* mode-specific payload */ }
}
```

---

## **Game Flow**

### **Single Player Flow**
1. Mode Selection → Setup (name) → Playing (Rounds 1-10) → Results → Play Again (loop) or Exit

### **Local Multiplayer Flow**
1. Mode Selection → Setup (both names) → Turn Barrier → Playing (P1 Rounds 1-10) → Turn Barrier → Playing (P2 Rounds 1-10) → Results

### **Network Game Flow**
1. Mode Selection → Network Selection
   - **Host Path**: Create Game (name) → Waiting for Player → Network Playing (both players simultaneously) → Results
   - **Guest Path**: Join Game (name + code) → Network Playing (synchronized with host) → Results

---

## **Key Features Implemented**

✅ **Image Display**: Gundams load from wikia CDN with fallback placeholder  
✅ **Randomization**: Fisher-Yates shuffle algorithm for Gundam pool  
✅ **Validation**: Case-insensitive, whitespace-normalized guess matching  
✅ **Scoring**: Point tracking with real-time UI updates  
✅ **Persistence**: High scores saved to localStorage  
✅ **Single Player**: 10-round solo mode with final score display  
✅ **Local Multiplayer**: Turn barrier prevents cheating on shared devices  
✅ **Network Multiplayer**: WebSocket-based real-time gameplay with room codes  
✅ **Responsive UI**: Screen-based navigation with CSS transitions  
✅ **Connection Management**: WebSocket disconnect handling with notifications

---

## **Browser Compatibility**

- Modern browsers supporting:
  - ES6+ JavaScript features
  - WebSocket API
  - localStorage
  - Flexbox/CSS Grid
  - Fetch API

---

## **Deployment Requirements**

- **Development Server**: `node server.js` (starts on port 3000)
- **Static Assets**: All HTML, CSS, JS, and JSON files served via HTTP
- **WebSocket**: Requires port 3000 open for network multiplayer
- **Network Access**: Clients must be able to reach server hostname and port
- **External Resources**: CDN image URLs must be accessible (wikia.nocookie.net)
