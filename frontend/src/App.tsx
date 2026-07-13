import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type UserInfo = {
  id: string;
  email: string;
  fullName: string;
  isOnline?: boolean;
};

type Conversation = {
  id: string;
  participants: UserInfo[];
  lastMessage: string | null;
  lastMessageAt: string | null;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: string;
  isSeen: boolean;
  createdAt: string;
};

type Session = {
  id: string;
  email: string;
  fullName: string;
  token: string;
};

const AUTH_KEY = "chat_session";

function loadSession(): Session | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<UserInfo | null>(null);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const authHeaders = (): Record<string, string> =>
    session
      ? { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const peer =
    recipient ||
    activeConversation?.participants.find((p) => p.id !== session?.id) ||
    null;

  const persistSession = (next: Session | null) => {
    if (next) localStorage.setItem(AUTH_KEY, JSON.stringify(next));
    else localStorage.removeItem(AUTH_KEY);
    setSession(next);
  };

  const refreshConversations = async (token?: string) => {
    const auth = token || session?.token;
    if (!auth) return;
    const res = await fetch("/chats", {
      headers: { Authorization: `Bearer ${auth}` },
    });
    if (!res.ok) {
      setStatus("Could not load conversations");
      return;
    }
    const data = await res.json();
    setConversations(data);
  };

  const loadMessages = async (conversationId: string) => {
    if (!session) return;
    const res = await fetch(`/chats/${conversationId}/messages`, { headers: authHeaders() });
    if (!res.ok) {
      setStatus("Could not load messages");
      return;
    }
    setMessages(await res.json());
  };

  useEffect(() => {
    if (!session) return;
    refreshConversations();
  }, [session?.token]);

  useEffect(() => {
    if (!session) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io("/", {
      auth: { token: session.token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setStatus("Connected"));
    socket.on("connect_error", (err) => setStatus(`Socket: ${err.message}`));

    const appendIfActive = (message: Message) => {
      const current = activeIdRef.current;
      if (current && message.conversationId !== current) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      if (!current) setActiveId(message.conversationId);
    };

    socket.on("message:received", (message: Message) => {
      appendIfActive(message);
      refreshConversations(session.token);
    });

    socket.on("message:sent", (message: Message) => {
      appendIfActive(message);
      setActiveId(message.conversationId);
      refreshConversations(session.token);
    });

    socket.on("typing:start", ({ conversationId }) => {
      if (conversationId === activeIdRef.current) setTyping(true);
    });
    socket.on("typing:stop", ({ conversationId }) => {
      if (conversationId === activeIdRef.current) setTyping(false);
    });
    socket.on("user:status", ({ userId, online }) => {
      setOnlineMap((prev) => ({ ...prev, [userId]: online }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const submitAuth = async () => {
    setStatus(mode === "login" ? "Signing in..." : "Creating account...");
    const path = mode === "login" ? "/auth/login" : "/auth/signup";
    const body =
      mode === "login"
        ? { email, password }
        : { email, password, fullName };

    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await res.json();
    if (!res.ok) {
      setStatus(result.message || "Auth failed");
      return;
    }

    const data = result.data;
    if (!data?.token || !data?.id) {
      setStatus("Auth succeeded but session data missing");
      return;
    }

    persistSession({
      id: data.id,
      email: data.email,
      fullName: data.fullName,
      token: data.token,
    });
    setStatus("Welcome");
    setPassword("");
  };

  const logout = async () => {
    if (session) {
      await fetch("/auth/logout", { method: "POST", headers: authHeaders() }).catch(() => undefined);
    }
    persistSession(null);
    setConversations([]);
    setMessages([]);
    setActiveId(null);
    setRecipient(null);
    setStatus("Signed out");
  };

  const openConversation = async (conversation: Conversation) => {
    setActiveId(conversation.id);
    setRecipient(conversation.participants.find((p) => p.id !== session?.id) || null);
    await loadMessages(conversation.id);
    socketRef.current?.emit("message:read", { conversationId: conversation.id });
  };

  const startChatByEmail = async () => {
    if (!session || !newChatEmail.trim()) return;
    setStatus("Looking up user...");
    const res = await fetch(`/auth/lookup?email=${encodeURIComponent(newChatEmail.trim())}`, {
      headers: authHeaders(),
    });
    const result = await res.json();
    if (!res.ok) {
      setStatus(result.message || "User not found");
      return;
    }
    if (result.id === session.id) {
      setStatus("You cannot chat with yourself");
      return;
    }

    const existing = conversations.find((c) =>
      c.participants.some((p) => p.id === result.id),
    );
    if (existing) {
      setNewChatEmail("");
      await openConversation(existing);
      setStatus(`Opened chat with ${result.fullName}`);
      return;
    }

    setRecipient(result);
    setActiveId(null);
    setMessages([]);
    setNewChatEmail("");
    setStatus(`New chat with ${result.fullName}`);
  };

  const emitTyping = (nextDraft: string) => {
    setDraft(nextDraft);
    if (!peer || !socketRef.current) return;
    socketRef.current.emit("typing:start", {
      conversationId: activeId,
      recipientId: peer.id,
    });
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      socketRef.current?.emit("typing:stop", {
        conversationId: activeId,
        recipientId: peer.id,
      });
    }, 900);
  };

  const sendMessage = () => {
    if (!session || !peer || !draft.trim() || !socketRef.current) {
      setStatus("Pick someone and write a message");
      return;
    }

    socketRef.current.emit("message:send", {
      recipientId: peer.id,
      content: draft.trim(),
      conversationId: activeId || undefined,
    });
    socketRef.current.emit("typing:stop", {
      conversationId: activeId,
      recipientId: peer.id,
    });
    setDraft("");
  };

  if (!session) {
    return (
      <div className="auth-screen">
        <div className="auth-atmosphere" aria-hidden />
        <div className="auth-copy">
          <p className="brand">Pulse</p>
          <h1>Messages that stay with you.</h1>
          <p className="lede">Sign in and start a direct conversation.</p>
        </div>
        <form
          className="auth-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitAuth();
          }}
        >
          <div className="tabs">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
              Sign up
            </button>
          </div>
          {mode === "signup" && (
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={mode === "signup" ? "Include a number and capital letter" : undefined}
            />
          </label>
          <button type="submit" className="primary">
            {mode === "login" ? "Enter chat" : "Create account"}
          </button>
          {status ? <p className="status">{status}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="chat-shell">
      <aside className="sidebar">
        <div className="sidebar-head">
          <div>
            <p className="brand">Pulse</p>
            <p className="you">{session.fullName}</p>
          </div>
          <button type="button" className="ghost" onClick={logout}>
            Out
          </button>
        </div>

        <div className="new-chat">
          <input
            value={newChatEmail}
            onChange={(e) => setNewChatEmail(e.target.value)}
            placeholder="Start chat by email"
            onKeyDown={(e) => {
              if (e.key === "Enter") startChatByEmail();
            }}
          />
          <button type="button" className="primary compact" onClick={startChatByEmail}>
            Go
          </button>
        </div>

        <ul className="conversation-list">
          {conversations.map((conversation) => {
            const other = conversation.participants.find((p) => p.id !== session.id);
            const online = other ? onlineMap[other.id] ?? other.isOnline : false;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  className={activeId === conversation.id ? "conversation active" : "conversation"}
                  onClick={() => openConversation(conversation)}
                >
                  <span className="avatar">{(other?.fullName || "?").slice(0, 1)}</span>
                  <span className="meta">
                    <span className="name-row">
                      <strong>{other?.fullName || "Unknown"}</strong>
                      <span className={online ? "dot on" : "dot"} />
                    </span>
                    <span className="preview">{conversation.lastMessage || "No messages yet"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="thread">
        {peer ? (
          <>
            <header className="thread-head">
              <div>
                <h2>{peer.fullName}</h2>
                <p>{typing ? "typing…" : peer.email}</p>
              </div>
            </header>

            <div className="message-stream">
              {messages.map((message) => {
                const mine = message.senderId === session.id;
                return (
                  <div key={message.id} className={mine ? "bubble mine" : "bubble"}>
                    <p>{message.content}</p>
                    <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              className="composer"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                value={draft}
                onChange={(e) => emitTyping(e.target.value)}
                placeholder={`Message ${peer.fullName}`}
              />
              <button type="submit" className="primary compact">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="empty-thread">
            <p className="brand">Pulse</p>
            <h2>Pick a conversation</h2>
            <p>Or start one with someone’s email.</p>
          </div>
        )}
        {status ? <p className="footer-status">{status}</p> : null}
      </main>
    </div>
  );
}

export default App;
