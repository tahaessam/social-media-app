# Pulse — Chat Frontend

React + Vite UI for the social media app’s **1:1 chat**.

## Run

Backend must be running first (default `http://localhost:3001`).

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

## What it does

- Sign up / login / logout
- Start a chat by the other user’s email
- Realtime messaging (Socket.IO)
- Conversation list, typing indicator, online status

## Proxy

Vite proxies these to the backend:

- `/auth`
- `/chats`
- `/socket.io`
- `/graphql`

If your backend uses a different port than `3001`, update `vite.config.ts`.

## Password rule

Signup passwords must include at least one uppercase letter and one number (e.g. `Pass123`).
