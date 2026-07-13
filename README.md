# Social Media App (Pulse Chat)

Node.js + Express + TypeScript backend with a React chat frontend (**Pulse**).  
Primary working feature today: **1:1 realtime chat**.

## What works now

- Sign up / login / logout (JWT)
- Signup auto-verifies and returns a token (dev-friendly)
- Lookup user by email
- Direct messages (REST + Socket.IO)
- Conversation list, typing indicators, online status
- Chat UI at `frontend/` (Pulse)

Also present in the API (partial / secondary): posts, comments, friend requests, OTP, Google OAuth, GraphQL.

## Tech stack

| Layer | Stack |
|-------|--------|
| Backend | Node.js, Express, TypeScript, MongoDB, Socket.IO |
| Auth | JWT, bcrypt, Passport Google (optional) |
| Cache | Redis if available, otherwise in-memory |
| Frontend | React, Vite, Socket.IO client |

## Prerequisites

- Node.js 20+
- MongoDB running locally (or Atlas URI in `.env`)
- Redis optional

## Environment

Create a `.env` in the project root (example values):

```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/social_media_app
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:3001

# Optional
REDIS_URL=redis://localhost:6379
EMAIL_USER=
EMAIL_PASS=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Run the app

### 1. Backend

```bash
cd d:\projects\social_media-app
npm install
npm run dev
```

API + sockets: **http://localhost:3001** (or whatever `PORT` is in `.env`)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: **http://localhost:5173**

Vite proxies `/auth`, `/chats`, `/socket.io` to the backend.

### 3. Try chat

1. Sign up user A (password needs a capital letter + number, e.g. `Pass123`)
2. Sign up user B in another browser / incognito
3. In A, start a chat with B’s email and send a message

## API overview

Auth header for protected routes:

```http
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register; returns `{ id, email, fullName, token }` |
| POST | `/auth/login` | No | Login; same shape |
| POST | `/auth/logout` | Yes | Invalidate session |
| GET | `/auth/lookup?email=` | Yes | Find user by email (start a chat) |
| POST | `/auth/confirm-email` | No | Confirm email token |
| PUT | `/auth/update-password` | Yes | Change password |
| POST | `/auth/forget-password` | No | Request reset |
| POST | `/auth/reset-password` | No | Reset with token |
| POST | `/auth/send-otp` | No | Send OTP |
| POST | `/auth/verify-otp` | No | Verify OTP |
| POST | `/auth/resend-otp` | No | Resend OTP |
| POST | `/auth/device-token` | Yes | Register FCM token |
| DELETE | `/auth/device-token` | Yes | Unregister FCM |
| GET | `/auth/users` | Admin | List users |
| GET | `/auth/google` | No | Google OAuth start |

### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chats` | Yes | List conversations (with participants) |
| GET | `/chats/:conversationId/messages` | Yes | Load messages (marks read) |
| POST | `/chats/send` | Yes | Send message `{ recipientId, content, conversationId? }` |

### Socket.IO

Connect with:

```js
io(url, { auth: { token } })
```

Events:

| Event | Direction | Payload |
|-------|-----------|---------|
| `message:send` | client → server | `{ recipientId, content, conversationId? }` |
| `message:sent` | server → sender | message object |
| `message:received` | server → recipient | message object |
| `message:read` | client → server | `{ conversationId }` |
| `typing:start` / `typing:stop` | both | `{ conversationId, recipientId }` / `{ conversationId, senderId }` |
| `user:status` | server → all | `{ userId, online }` |
| `conversation:update` | server → all | `{ conversationId, lastMessage, lastMessageAt }` |

### Other API groups

- **Posts**: `POST/GET/PUT/DELETE /posts`, reactions under `/posts/:id/reactions`
- **Comments**: `POST/GET/PUT/DELETE /comments`, reactions under `/comments/:id/reactions`
- **Requests**: send / accept / decline / cancel / remove under `/requests`
- **Health**: `GET /`, `GET /ping`
- **GraphQL**: `POST/GET /graphql`

## Postman

Import [`postman_collection.json`](./postman_collection.json).

1. Set `baseUrl` if needed (default `http://localhost:3001`)
2. Run **POST /auth/signup** or **login** — scripts save `token` and `userId`
3. Set `lookupEmail` to another user’s email, run **GET /auth/lookup**
4. Use **Chat** folder to list conversations / send messages

## Project layout

```
src/                  # backend
  modules/users/      # auth
  modules/chats/      # conversations + messages
  modules/posts/
  modules/comments/
  modules/requests/
  common/sockets/     # Socket.IO
frontend/             # Pulse chat UI
postman_collection.json
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Backend with `tsx` |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled `dist` |
| `cd frontend && npm run dev` | Chat UI |

## Notes

- Redis is optional; sessions/cache fall back to memory.
- Firebase push is optional; missing credentials won’t crash the server.
- This is a **dev** chat setup, not a production social network yet.
