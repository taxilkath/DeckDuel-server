# 🎴 DeckDuel - Multiplayer Card Game Server

DeckDuel is a multiplayer online card game server inspired by the traditional Indian game Andar Bahar. This backend system manages game logic, real-time multiplayer interactions, user accounts, social features, and monetization components for a fully featured online betting-style card game.

---

## 🕹️ Game Overview
DeckDuel brings the excitement of fast-paced card games to an online multiplayer environment. Players can join tables, place bids, and play against each other or bots in a high-stakes, real-time format.

---

## ♠️ Core Gameplay
- **Game Type:** Based on Andar Bahar – players bet on either "Andar" or "Bahar" piles.
- **Game Tables:** Join public or private tables with various bet amounts.
- **Bots Support:** Bots fill empty seats to keep gameplay active.
- **Card Logic:** Handles deck creation, shuffling, drawing, and match logic.
- **Two-Phase Bidding:** Players bid in multiple phases to increase suspense.
- **Timers:** Turn-based system with timeouts to ensure game flow.
- **Winning Logic:** Winners receive chips based on dealt cards and placed bets.

---

## 👤 User Management & Progression
- **Authentication:** Guest login or third-party providers (e.g., Facebook).
- **User Profiles:** Username, avatar, chip/coin balance, game stats, and more.
- **Progression System:** Leveling and ranking (details configurable).
- **Currency System:**
  - **Chips:** Primary in-game currency for tables and gameplay.
  - **Coins:** Used for cosmetics, gifts, and premium features.

---

## 💬 Social Features
- **Friends System:** Add, remove, or view friends.
- **Friend Requests:** Send/receive requests with notifications.
- **Block/Unblock Users**
- **Virtual Gifts:** Send gifts at tables (costs chips).
- **In-Game Chat:** Real-time chat between players at the same table.

---

## 💰 Monetization
- **Chip Store:** Buy chips with real money.
- **Coin Store:** Purchase coins for cosmetic upgrades.
- **In-App Purchases:** Handled via mobile app store integrations.

---

## 🎯 Engagement Features
- **Daily Bonus:** Collect daily free chips.
- **Leaderboards:** Global, country-based, and friends’ rankings (weekly & all-time).
- **Notifications:** System messages for requests, gifts, and game events.
- **Weekly Winner Contest:** Compete for prizes weekly.

---

## 🛠️ Technical Details
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Real-Time:** Socket.IO for low-latency multiplayer communication
- **API:** REST API for uploading avatars and other operations

---

## 📡 Socket.IO Events

### Client → Server Events

| Event | Description | Data Payload |
|-------|-------------|--------------|
| **GSP** | Guest Sign Up/Login: Creates a guest account or logs in with a device's serial number | `{ "sno": "unique_serial_number", "det": "device_type", "ult": "guest" }` |
| **TPSP** | Third-Party Sign Up/Login: Authenticates a user via a third party like Facebook | `{ "tId": "third_party_user_id", "det": "device_type", "ult": "fb" }` |
| **JT** | Join Table: Places the user at a game table. Can be public, private, or a tournament | `{ "user_id": "...", "tt": "DJ/PJ/TJ", "is_private": 0/1 }` |
| **RL** | Room Leave: Removes a user from their current game room | `{ "user_id": "...", "roomId": "..." }` |
| **SB** | Set Bid: A player places a bet on either the "Andar" (0) or "Bahar" (1) pile | `{ "user_id": "...", "roomId": "...", "bidType": 0/1, "bidAmount": number }` |
| **SU** | Stand Up: Allows a player to leave their seat but remain in the room as a spectator | `{ "user_id": "...", "roomId": "..." }` |
| **UP** | User Profile: Fetches the profile details of another user at the same table | `{ "user_id": "...", "other_id": "..." }` |
| **FL** | Friends List: Retrieves the user's friends list, with filters for online, all, or blocked | `{ "user_id": "...", "flt": 1/2/3 }` (1=online, 2=all, 3=blocked) |
| **SFR** | Send Friend Request: Sends a friend request to another user | `{ "user_id": "...", "other_id": "..." }` |
| **AFR** | Action Friend Request: Allows a user to accept (1) or decline (0) a pending friend request | `{ "user_id": "...", "other_id": "...", "IA": 1/0 }` |
| **CSL** | Chip Store List: Fetches the available packages in the chip store | `{ "user_id": "..." }` |
| **COSL** | Coin Store List: Fetches the available packages in the coin store | `{ "user_id": "..." }` |
| **CIAP** | Coin/Chip In-App Purchase: Verifies an in-app purchase and credits the user's account | `{ "user_id": "...", "ptype": "chips/coins", "pdata": "purchase_receipt_data", "productId": "..." }` |

### Server → Client Events

| Event | Description | Data Payload |
|-------|-------------|--------------|
| **ST** | Server Time: Periodically sends the current server time to the client | `{ "time": "iso_timestamp" }` |
| **DE** | Display Error: Sends a user-facing error message to be displayed on the client | `{ "msg": "Error message to display" }` |
| **GTI** | Game Table Info: Sends the complete state of a game table when a user joins | `{ "tableId": "...", "players": [...], "gameState": "..." }` |
| **NT** | New Turn: Announces the start of a new turn and the active player | `{ "activePlayer": "...", "countdown": number }` |
| **BC** | Bid Confirmed: Confirms a player's bid and broadcasts it to everyone at the table | `{ "user_id": "...", "bidType": 0/1, "bidAmount": number }` |
| **GR** | Game Result: Announces the result of a round, including the winner and winnings | `{ "winner": "...", "winnings": number, "gameState": "..." }` |

---

## 📂 Project Structure
```
AndarBahar/
├── classes/           # Game logic, user, chat, store, and more (modular classes)
├── database/          # JSON data files (dev/demo or backup)
├── public/            # Static assets (e.g., profile images)
├── routes/            # API routes
├── http-andar-bajar-server.js  # Main server entry point
├── .env.example       # Environment variable template
├── .gitignore         # Git ignore rules
├── package.json       # Project metadata and dependencies
```

---

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/deckduel-backend.git
   cd deckduel-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values.

4. **Start the server:**
   ```bash
   npm start
   ```

---

## 📜 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details. 