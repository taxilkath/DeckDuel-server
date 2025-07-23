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