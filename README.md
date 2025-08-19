# Chat App (React Native + Node.js)

## Setup

### Server
```bash
cd server
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npm start
```

## Env Vars
- `MONGO_URI=mongodb://localhost:27017/chatapp`
- `JWT_SECRET=secret`

## Features
- Register / Login (JWT auth)
- User list
- 1:1 real-time chat (Socket.IO)
- Typing indicators
- Online/offline status
- Read receipts
