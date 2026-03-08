"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/system/profile/messages.module.css";
import { API_ROUTES, API_ENDPOINTS } from "@/constants/api";
import Ably from "ably";
import type { RealtimeChannel, InboundMessage } from "ably";

type ChatItem = {
  id: string;
  title: string;
  lastSender: string;
  lastText: string;
  pinned?: boolean;
  unread?: number;
  membersCount?: number;
  lastMessageAt?: string | null;
};

type Msg = {
  id: string;
  who: "other" | "me";
  name?: string;
  text: string;
  atAll?: boolean;
  time?: string;
  createdAt?: string;
};

type ApiChat = {
  id: string;
  type: "DIRECT" | "GROUP";
  title: string;
  lastSender: string;
  lastText: string;
  lastMessageAt?: string | null;
  membersCount?: number;
  pinned?: boolean;
  unread?: number;
};

type ApiMessage = {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; email: string; profile?: { firstName?: string | null; lastName?: string | null } | null };
};

type FriendUser = {
  id: string;
  email: string;
  image?: string | null;
  profile?: { firstName?: string | null; lastName?: string | null; username?: string | null } | null;
};

type IncomingRequest = {
  id: string;
  createdAt?: string;
  from: FriendUser;
};

type AblyMessageData = {
  id?: string;
  conversationId?: string;
  lastText?: string;
  sender?: { name?: string; id?: string };
  lastMessageAt?: string;
  createdAt?: string;
  text?: string;
};

function formatTime(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function detectAtAll(text: string) {
  const t = text.toLowerCase();
  return t.includes("@all") || t.includes("@everyone");
}

function displayName(u: {
  email: string;
  profile?: { firstName?: string | null; lastName?: string | null; username?: string | null } | null;
}) {
  const p = u.profile;
  const name = p?.firstName || p?.lastName ? `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim() : "";
  return name || p?.username || u.email;
}

function isLikelyEmail(v: string) {
  const s = v.trim();
  return s.includes("@") && s.includes(".") && s.length >= 6;
}

const EMOJIS = ["👍", "❤️", "😂", "😢", "😡", "😮", "🎉", "🔥"];

export default function AdminMessagesClient() {
  const [meId, setMeId] = useState<string>("");

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string>("");

  const [tab, setTab] = useState<"all" | "unread" | "pinned">("all");
  const [q, setQ] = useState("");

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>("");

  const [messagesByChat, setMessagesByChat] = useState<Record<string, Msg[]>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const threadRef = useRef<HTMLDivElement | null>(null);

  const [showNewChat, setShowNewChat] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState("");

  const [newChatTab, setNewChatTab] = useState<"friends" | "requests" | "add">("friends");

  const [addEmail, setAddEmail] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addMsg, setAddMsg] = useState<string>("");

  const [incoming, setIncoming] = useState<IncomingRequest[]>([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [incomingError, setIncomingError] = useState("");

  const [ablyClient, setAblyClient] = useState<Ably.Realtime | null>(null);
  const [ablyConnected, setAblyConnected] = useState(false);

  const ablyChatChannelRef = useRef<RealtimeChannel | null>(null);
  const [textColor, setTextColor] = useState<string>("#111827");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchHits, setSearchHits] = useState<number[]>([]);
  const [hitIndex, setHitIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  const isAblyConnected = (client: Ably.Realtime | null) => client?.connection?.state === "connected";

  const refreshChats = useCallback(async (setActiveIfMissing = false) => {
    setLoadingChats(true);
    setError("");
    try {
      const res = await fetch(API_ROUTES.ADMIN_CHAT.CONVERSATIONS, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load conversations");

      const rows: ApiChat[] = Array.isArray(json?.chats) ? json.chats : [];
      const mapped: ChatItem[] = rows.map((c) => ({
        id: c.id,
        title: c.title,
        lastSender: c.lastSender ?? "",
        lastText: c.lastText ?? "",
        lastMessageAt: c.lastMessageAt ?? null,
        membersCount: c.membersCount ?? 0,
        pinned: !!c.pinned,
        unread: c.unread ?? 0,
      }));

      setChats(mapped);

      if (setActiveIfMissing) {
        setActiveChatId((prev) => prev || mapped[0]?.id || "");
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    setFriendsLoading(true);
    setFriendsError("");
    try {
      const res = await fetch(API_ROUTES.ADMIN_FRIENDS.LIST, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load friends");
      const list: FriendUser[] = Array.isArray(json?.friends) ? json.friends : [];
      setFriends(list);
    } catch (e: unknown) {
      setFriendsError((e as Error)?.message || "Failed to load friends");
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  const loadIncoming = useCallback(async () => {
    setIncomingLoading(true);
    setIncomingError("");
    try {
      const res = await fetch(API_ROUTES.ADMIN_FRIENDS.REQUESTS("incoming"), { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load requests");

      const rows = Array.isArray(json?.requests) ? json.requests : [];
      const mapped: IncomingRequest[] = rows
        .map((r: { id: string; createdAt?: string; from: FriendUser }) => {
          if (!r?.id || !r?.from?.id) return null;
          return {
            id: String(r.id),
            createdAt: r?.createdAt ? String(r.createdAt) : undefined,
            from: {
              id: String(r.from.id),
              email: String(r.from.email),
              image: r.from.image ?? null,
              profile: r.from.profile ?? null,
            },
          } as IncomingRequest;
        })
        .filter(Boolean) as IncomingRequest[];

      setIncoming(mapped);
    } catch (e: unknown) {
      setIncomingError((e as Error)?.message || "Failed to load requests");
    } finally {
      setIncomingLoading(false);
    }
  }, []);

  const acceptIncoming = useCallback(
    async (requestId: string) => {
      setError("");
      try {
        const res = await fetch(API_ROUTES.ADMIN_FRIENDS.ACCEPT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Accept failed");

        await Promise.all([loadIncoming(), loadFriends()]);
        setAddMsg("Đã chấp nhận lời mời kết bạn.");
        setNewChatTab("friends");
      } catch (e: unknown) {
        setError((e as Error)?.message || "Accept failed");
      }
    },
    [loadIncoming, loadFriends],
  );

  const sendFriendRequestByEmail = useCallback(async () => {
    const email = addEmail.trim().toLowerCase();
    if (!isLikelyEmail(email) || addBusy) return;

    setAddBusy(true);
    setAddMsg("");
    setError("");

    try {
      const res = await fetch(API_ROUTES.ADMIN_FRIENDS.REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok) {
        const code = json?.error || "Send failed";
        if (code === "USER_NOT_FOUND") throw new Error("Không tìm thấy user với email này.");
        if (code === "CANNOT_ADD_SELF") throw new Error("Bạn không thể tự kết bạn với chính mình.");
        if (code === "REQUEST_ALREADY_SENT") throw new Error("Bạn đã gửi lời mời trước đó.");
        if (code === "ALREADY_FRIEND") throw new Error("Hai bạn đã là bạn bè rồi.");
        if (code === "BLOCKED") throw new Error("Không thể gửi lời mời (bị block).");
        throw new Error(code);
      }

      setAddEmail("");
      setAddMsg("Đã gửi lời mời kết bạn. Chờ đối phương ACCEPT.");
      await loadIncoming();
    } catch (e: unknown) {
      setAddMsg("");
      setError((e as Error)?.message || "Send request failed");
    } finally {
      setAddBusy(false);
    }
  }, [addEmail, addBusy, loadIncoming]);

  const startDirect = useCallback(
    async (otherUserId: string) => {
      setError("");
      try {
        const res = await fetch(API_ROUTES.ADMIN_CHAT.DIRECT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otherUserId }),
        });
        const json = await res.json();

        if (!res.ok) {
          if (json?.error === "NOT_FRIEND") throw new Error("Bạn chưa kết bạn với người này (chỉ chat khi đã ACCEPT).");
          throw new Error(json?.error || "Cannot start chat");
        }

        const conversationId = String(json?.conversationId || "");
        if (!conversationId) throw new Error("Missing conversationId");

        setShowNewChat(false);

        await refreshChats(false);
        setActiveChatId(conversationId);
      } catch (e: unknown) {
        setError((e as Error)?.message || "Cannot start chat");
      }
    },
    [refreshChats],
  );

  // Fetch current admin user id
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ADMIN.PROFILE, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.user?.id) throw new Error(json?.error || "Cannot load current user");
        if (!alive) return;
        setMeId(String(json.user.id));
      } catch (e: unknown) {
        if (!alive) return;
        setError((e as Error)?.message || "Failed to load current user");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Initial load chats
  useEffect(() => {
    refreshChats(true);
  }, [refreshChats]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  // clear unread when open chat
  useEffect(() => {
    if (!activeChatId) return;
    setChats((prev) => prev.map((c) => (c.id === activeChatId ? { ...c, unread: 0 } : c)));
  }, [activeChatId]);

  // Load messages of active chat (from DB)
  useEffect(() => {
    if (!activeChatId) return;

    let alive = true;
    setLoadingMsgs(true);
    setError("");

    (async () => {
      try {
        const res = await fetch(API_ROUTES.ADMIN_CHAT.MESSAGES(activeChatId), { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load messages");

        const rows: ApiMessage[] = Array.isArray(json?.messages) ? json.messages : [];

        const mapped: Msg[] = rows.map((m) => {
          const senderName = displayName({ email: m.sender?.email, profile: m.sender?.profile ?? null });

          return {
            id: m.id,
            who: meId && m.sender?.id === meId ? "me" : "other",
            name: senderName,
            text: m.text,
            atAll: detectAtAll(m.text),
            time: formatTime(m.createdAt),
            createdAt: m.createdAt,
          };
        });

        if (!alive) return;

        setMessagesByChat((prev) => ({ ...prev, [activeChatId]: mapped }));
        requestAnimationFrame(() => {
          threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
        });
      } catch (e: unknown) {
        if (!alive) return;
        setError((e as Error)?.message || "Failed to load messages");
      } finally {
        if (!alive) return;
        setLoadingMsgs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeChatId, meId]);

  // ✅ Setup Ably client once (robust state tracking)
  useEffect(() => {
    const client = new Ably.Realtime({
      authUrl: API_ROUTES.ADMIN_CHAT.ABLY_TOKEN,
    });

    const onState = () => {
      setAblyConnected(client.connection.state === "connected");
    };

    // Track ALL state changes (includes closed)
    client.connection.on(onState);
    onState();

    setAblyClient(client);

    return () => {
      try {
        ablyChatChannelRef.current?.unsubscribe();
      } catch {}
      try {
        client.close();
      } catch {}
      ablyChatChannelRef.current = null;
      setAblyClient(null);
      setAblyConnected(false);
    };
  }, []);

  // ✅ Subscribe inbox so sidebar/unread updates without reload (safe against "Connection closed")
  useEffect(() => {
    if (!ablyClient || !meId) return;
    if (!isAblyConnected(ablyClient)) return;

    const channelName = `inbox:${meId}`;
    const channel = ablyClient.channels.get(channelName);

    const handler = (msg: InboundMessage) => {
      const data = (msg.data || {}) as AblyMessageData;
      const conversationId = String(data?.conversationId || "");
      if (!conversationId) return;

      const lastText = String(data?.lastText || "");
      const lastSender = String(data?.sender?.name || "User");
      const lastMessageAt = data?.lastMessageAt ? String(data.lastMessageAt) : new Date().toISOString();

      setChats((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId);
        const incUnread = conversationId !== activeChatIdRef.current ? 1 : 0;

        if (idx >= 0) {
          const updated = [...prev];
          const curr = updated[idx];

          updated[idx] = {
            ...curr,
            lastSender,
            lastText,
            lastMessageAt,
            unread: (curr.unread ?? 0) + incUnread,
          };

          const pinned = updated.filter((x) => x.pinned);
          const normal = updated.filter((x) => !x.pinned);
          normal.sort((a, b) => (b.lastMessageAt || "").localeCompare(a.lastMessageAt || ""));
          return [...pinned, ...normal];
        }

        refreshChats(false);
        return prev;
      });
    };

    try {
      channel.subscribe("inbox:new", handler);
    } catch (e) {
      console.warn("Ably subscribe inbox failed:", e);
      return;
    }

    return () => {
      try {
        channel.unsubscribe("inbox:new", handler);
        ablyClient.channels.release(channelName);
      } catch {}
    };
  }, [ablyClient, ablyConnected, meId, refreshChats]);

  // ✅ Subscribe chat channel so message appears immediately in the thread (safe)
  useEffect(() => {
    if (!ablyClient || !activeChatId || !meId) return;
    if (!isAblyConnected(ablyClient)) return;

    // cleanup old
    try {
      ablyChatChannelRef.current?.unsubscribe();
    } catch {}

    const channelName = `chat:${activeChatId}`;
    const channel = ablyClient.channels.get(channelName);
    ablyChatChannelRef.current = channel;

    const handler = (msg: InboundMessage) => {
      const data = (msg.data || {}) as AblyMessageData;
      const createdAt = data?.createdAt ? String(data.createdAt) : new Date().toISOString();
      const senderId = data?.sender?.id ? String(data.sender.id) : "";
      const senderName = data?.sender?.name ? String(data.sender.name) : "User";
      const text = String(data?.text || "");

      const next: Msg = {
        id: String(data?.id || `rt_${Date.now()}`),
        who: senderId === meId ? "me" : "other",
        name: senderName,
        text,
        atAll: detectAtAll(text),
        time: formatTime(createdAt),
        createdAt,
      };

      setMessagesByChat((prev) => {
        const curr = prev[activeChatId] ?? [];
        if (curr.some((m) => m.id === next.id)) return prev;
        return { ...prev, [activeChatId]: [...curr, next] };
      });

      requestAnimationFrame(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
      });
    };

    try {
      channel.subscribe("message:new", handler);
    } catch (e) {
      console.warn("Ably subscribe chat failed:", e);
      return;
    }

    return () => {
      try {
        channel.unsubscribe("message:new", handler);
        ablyClient.channels.release(channelName);
      } catch {}
    };
  }, [ablyClient, ablyConnected, activeChatId, meId]);

  const msgs = useMemo(() => messagesByChat[activeChatId] ?? [], [messagesByChat, activeChatId]);

  const filteredChats = useMemo(() => {
    const qq = q.trim().toLowerCase();

    let base = chats;
    if (tab === "unread") base = base.filter((c) => (c.unread ?? 0) > 0);
    if (tab === "pinned") base = base.filter((c) => !!c.pinned);

    if (!qq) return base;

    return base.filter((c) => {
      const hay = `${c.title} ${c.lastSender} ${c.lastText}`.toLowerCase();
      return hay.includes(qq);
    });
  }, [chats, q, tab]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !activeChatId || sending) return;

    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const optimistic: Msg = {
      id: tempId,
      who: "me",
      name: "Me",
      text,
      atAll: detectAtAll(text),
      time: formatTime(nowIso),
      createdAt: nowIso,
    };

    setMessagesByChat((prev) => {
      const curr = prev[activeChatId] ?? [];
      return { ...prev, [activeChatId]: [...curr, optimistic] };
    });

    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === activeChatId);
      if (idx < 0) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], lastSender: "Me", lastText: text, lastMessageAt: nowIso };
      return updated;
    });

    setInput("");
    requestAnimationFrame(() => {
      threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
    });

    try {
      const res = await fetch(API_ROUTES.ADMIN_CHAT.SEND(activeChatId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Send failed");

      const real: ApiMessage | undefined = json?.message;
      if (real?.id) {
        setMessagesByChat((prev) => {
          const curr = prev[activeChatId] ?? [];

          const hasRealAlready = curr.some((m) => m.id === real.id);
          if (hasRealAlready) {
            return {
              ...prev,
              [activeChatId]: curr.filter((m) => m.id !== tempId),
            };
          }

          return {
            ...prev,
            [activeChatId]: curr.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    id: real.id,
                    createdAt: real.createdAt,
                    time: formatTime(real.createdAt),
                    name: displayName({ email: real.sender?.email, profile: real.sender?.profile ?? null }),
                  }
                : m,
            ),
          };
        });
      }
    } catch (e: unknown) {
      setMessagesByChat((prev) => {
        const curr = prev[activeChatId] ?? [];
        return { ...prev, [activeChatId]: curr.filter((m) => m.id !== tempId) };
      });
      setInput(text);
      setError((e as Error)?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }, [input, activeChatId, sending]);

  // Thread search hits
  useEffect(() => {
    const qq = searchText.trim().toLowerCase();
    if (!qq) {
      setSearchHits([]);
      setHitIndex(0);
      return;
    }

    const hits: number[] = [];
    msgs.forEach((m, idx) => {
      if ((m.text || "").toLowerCase().includes(qq)) hits.push(idx);
    });

    setSearchHits(hits);
    setHitIndex(0);
  }, [searchText, msgs]);

  const jumpToHit = useCallback(
    (nextIndex: number) => {
      if (!searchHits.length) return;
      const clamped = Math.max(0, Math.min(nextIndex, searchHits.length - 1));
      setHitIndex(clamped);

      const msg = msgs[searchHits[clamped]];
      if (!msg) return;

      const el = msgRefs.current[msg.id];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [searchHits, msgs],
  );

  // ESC to close search
  useEffect(() => {
    if (!showSearch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSearch(false);
        setSearchText("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSearch]);

  return (
    <div className={styles.wrap}>
      {/* ===== Sidebar ===== */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <span className={styles.sidebarTitleIcon}>
              <i className="bi bi-chat-left-text" />
            </span>
            <div className={styles.sidebarTitleText}>
              <div className={styles.sidebarTitleMain}>Chats</div>
              <div className={styles.sidebarTitleSub}>Team inbox</div>
            </div>
          </div>

          {/* New chat = open panel */}
          <button
            className={styles.newChatBtn}
            type="button"
            title="New chat / Friends"
            onClick={async () => {
              const nextShow = !showNewChat;
              setShowNewChat(nextShow);
              if (nextShow) {
                setNewChatTab("friends");
                await Promise.all([loadFriends(), loadIncoming()]);
              }
            }}
          >
            <i className="bi bi-person-plus" />
          </button>

          {/* Refresh chats */}
          <button
            className={styles.newChatBtn}
            type="button"
            title="Refresh chats"
            onClick={() => refreshChats(false)}
            style={{ marginLeft: 8 }}
          >
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>

        {/* Friends/Requests/Add panel */}
        {showNewChat ? (
          <div style={{ padding: 12, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>Friends</div>
              <button type="button" className={styles.iconBtn} onClick={() => setShowNewChat(false)} title="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.tabs} style={{ marginBottom: 10 }}>
              <button
                className={`${styles.tab} ${newChatTab === "friends" ? styles.tabActive : ""}`}
                type="button"
                onClick={() => setNewChatTab("friends")}
              >
                Friends
              </button>
              <button
                className={`${styles.tab} ${newChatTab === "requests" ? styles.tabActive : ""}`}
                type="button"
                onClick={async () => {
                  setNewChatTab("requests");
                  if (incoming.length === 0) await loadIncoming();
                }}
              >
                Requests
              </button>
              <button
                className={`${styles.tab} ${newChatTab === "add" ? styles.tabActive : ""}`}
                type="button"
                onClick={() => setNewChatTab("add")}
              >
                Add
              </button>
            </div>

            {addMsg ? <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>{addMsg}</div> : null}

            {newChatTab === "friends" ? (
              <>
                {friendsError ? (
                  <div style={{ fontSize: 13, opacity: 0.95, marginBottom: 8 }}>
                    <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }} />
                    {friendsError}
                  </div>
                ) : null}

                {friendsLoading ? (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Loading friends…</div>
                ) : friends.length === 0 ? (
                  <div className={styles.emptyNotice}>
                    <i className={`bi bi-people ${styles.emptyIcon}`} />
                    <div className={styles.emptyText}>
                      <div className={styles.emptyTitle}>No friends yet</div>
                      <div className={styles.emptyDesc}>
                        Go to <b>Add</b> to send invitations or check <b>Requests</b> to accept new friends.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {friends.map((u) => {
                      const name = displayName(u);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => startDirect(u.id)}
                          className={styles.chatRow}
                          style={{ textAlign: "left" }}
                          title={`Chat with ${name}`}
                        >
                          <div className={styles.chatAvatar}>
                            <i className="bi bi-person" />
                            <span className={styles.chatOnlineDot} />
                          </div>

                          <div className={styles.chatMeta}>
                            <div className={styles.chatTopLine}>
                              <div className={styles.chatName}>{name}</div>
                            </div>
                            <div className={styles.chatPreview}>
                              <span className={styles.chatText}>{u.email}</span>
                            </div>
                          </div>

                          <span className={styles.chatChevron}>
                            <i className="bi bi-chevron-right" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}

            {newChatTab === "requests" ? (
              <>
                {incomingError ? (
                  <div style={{ fontSize: 13, opacity: 0.95, marginBottom: 8 }}>
                    <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }} />
                    {incomingError}
                  </div>
                ) : null}

                <div className={styles.requestSectionHead}>
                  <div className={styles.requestHeadLeft}>
                    <div className={styles.requestIcon}>
                      <i className="bi bi-person-plus" />
                    </div>
                    <div className={styles.requestHeadText}>
                      <div className={styles.requestTitle}>Incoming requests</div>
                      <div className={styles.requestSubtitle}>Review and respond to new friend invitations</div>
                    </div>
                  </div>

                  <button type="button" className={styles.iconBtn} title="Refresh requests" onClick={loadIncoming}>
                    <i className="bi bi-arrow-clockwise" />
                  </button>
                </div>

                {incomingLoading ? (
                  <div className={styles.stateBox}>
                    <i className={`bi bi-arrow-repeat ${styles.spin}`} />
                    <span>Loading requests…</span>
                  </div>
                ) : incoming.length === 0 ? (
                  <div className={styles.stateBox}>
                    <i className="bi bi-inbox" />
                    <span>Không có lời mời kết bạn nào.</span>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {incoming.map((r) => {
                      const name = displayName(r.from);
                      return (
                        <div
                          key={r.id}
                          className={styles.chatRow}
                          style={{ display: "flex", alignItems: "center", gap: 10 }}
                        >
                          <div className={styles.chatAvatar} style={{ flex: "0 0 auto" }}>
                            <i className="bi bi-person" />
                            <span className={styles.chatOnlineDot} />
                          </div>

                          <div className={styles.chatMeta} style={{ flex: "1 1 auto" }}>
                            <div className={styles.chatTopLine}>
                              <div className={styles.chatName}>{name}</div>
                            </div>
                            <div className={styles.chatPreview}>
                              <span className={styles.chatText}>{r.from.email}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={styles.sendBtn}
                            style={{ padding: "8px 10px", minWidth: 90 }}
                            onClick={() => acceptIncoming(r.id)}
                            title="Accept"
                          >
                            <i className="bi bi-check2" />
                            <span className={styles.sendText} style={{ marginLeft: 6 }}>
                              Accept
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : null}

            {newChatTab === "add" ? (
              <>
                <div className={styles.addFriendBox}>
                  <div className={styles.addFriendField}>
                    <label className={styles.addFriendLabel}>Add friend by email</label>

                    <div className={styles.addFriendInputWrap}>
                      <i className={`bi bi-envelope ${styles.addFriendInputIcon}`} />
                      <input
                        className={styles.input}
                        placeholder="Enter email to add friend (e.g. admin1@example.com)"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendFriendRequestByEmail();
                        }}
                        disabled={addBusy}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.sendBtn}
                    onClick={sendFriendRequestByEmail}
                    disabled={addBusy || !isLikelyEmail(addEmail)}
                    title="Send friend request"
                  >
                    <i className={`bi ${addBusy ? "bi-arrow-repeat" : "bi-send"} ${addBusy ? styles.spin : ""}`} />
                    <span className={styles.sendText}>{addBusy ? "Sending…" : "Send request"}</span>
                  </button>

                  <div className={styles.tipBox}>
                    <i className={`bi bi-info-circle ${styles.tipIcon}`} />
                    <div className={styles.tipText}>
                      Tip: Người nhận phải vào tab <b>Requests</b> để <b>Accept</b> thì bạn mới chat được.
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        {/* Sidebar Search */}
        <div className={styles.sidebarTools}>
          <div className={styles.searchBox}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              className={styles.searchInput}
              placeholder="Search chats…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className={styles.searchAction} type="button" title="Clear" onClick={() => setQ("")}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "all" ? styles.tabActive : ""}`}
              type="button"
              onClick={() => setTab("all")}
            >
              All
            </button>
            <button
              className={`${styles.tab} ${tab === "unread" ? styles.tabActive : ""}`}
              type="button"
              onClick={() => setTab("unread")}
            >
              Unread
            </button>
            <button
              className={`${styles.tab} ${tab === "pinned" ? styles.tabActive : ""}`}
              type="button"
              onClick={() => setTab("pinned")}
            >
              Pinned
            </button>
          </div>
        </div>

        <div className={styles.chatList}>
          {loadingChats ? (
            <div className={styles.emptyState}>
              <i className={`bi bi-arrow-repeat ${styles.spin}`} />
              <span>Loading chats…</span>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="bi bi-chat-dots" />
              <span>No chats</span>
            </div>
          ) : (
            filteredChats.map((c) => {
              const active = c.id === activeChatId;
              const unread = c.unread ?? 0;

              return (
                <button
                  key={c.id}
                  className={`${styles.chatRow} ${active ? styles.chatRowActive : ""}`}
                  onClick={() => setActiveChatId(c.id)}
                  type="button"
                >
                  <div className={styles.chatAvatar}>
                    <i className="bi bi-people" />
                    <span className={styles.chatOnlineDot} />
                  </div>

                  <div className={styles.chatMeta}>
                    <div className={styles.chatTopLine}>
                      <div className={styles.chatRight}>
                        {c.pinned && (
                          <span className={styles.pin} title="Pinned">
                            <i className="bi bi-bookmark-fill" />
                          </span>
                        )}
                        {unread > 0 && <span className={styles.unreadBadge}>{unread}</span>}
                      </div>
                    </div>

                    <div className={styles.chatPreview}>
                      <span className={styles.chatSender}>{c.lastSender ? `${c.lastSender}:` : ""}</span>
                      <span className={styles.chatText}>{c.lastText}</span>
                    </div>
                  </div>

                  <span className={styles.chatChevron}>
                    <i className="bi bi-chevron-right" />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className={styles.main}>
        <header className={styles.header}>
          {/* Search overlay INSIDE header */}
          {showSearch && (
            <div className={styles.searchOverlay}>
              <div className={styles.searchHeaderInner}>
                <i className="bi bi-search" />
                <input
                  ref={searchInputRef}
                  className={styles.searchThreadInput}
                  placeholder="Search in this thread..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <div className={styles.searchNav}>
                  <span className={styles.searchCount}>
                    {searchHits.length > 0 ? `${hitIndex + 1} of ${searchHits.length}` : "No results"}
                  </span>
                  <button
                    className={styles.searchNavBtn}
                    disabled={searchHits.length === 0}
                    onClick={() => jumpToHit(hitIndex - 1)}
                    title="Previous"
                    type="button"
                  >
                    <i className="bi bi-chevron-up" />
                  </button>
                  <button
                    className={styles.searchNavBtn}
                    disabled={searchHits.length === 0}
                    onClick={() => jumpToHit(hitIndex + 1)}
                    title="Next"
                    type="button"
                  >
                    <i className="bi bi-chevron-down" />
                  </button>
                  <button
                    className={styles.searchNavBtn}
                    onClick={() => {
                      setShowSearch(false);
                      setSearchText("");
                    }}
                    title="Close search"
                    type="button"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.headerLeft}>
            <div className={styles.headerAvatar}>
              <i className="bi bi-people-fill" />
            </div>

            <div className={styles.headerTitleBox}>
              <div className={styles.headerKicker}>
                <span className={styles.kickerDot} />
                <span>Workspace</span>
                <i className="bi bi-chevron-right" />
                <span className={styles.kickerStrong}>Messages</span>
              </div>

              <div className={styles.headerTitleRow}>
                <div className={styles.headerTitle}>{activeChat?.title ?? "—"}</div>
                <span className={styles.membersPill}>
                  <i className="bi bi-people" />
                  <span>{activeChat?.membersCount ?? 0} members</span>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.iconBtn}
              type="button"
              title="Search messages"
              onClick={() => {
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }}
            >
              <i className="bi bi-search" />
            </button>

            <button className={styles.iconBtn} type="button" title="Info">
              <i className="bi bi-info-circle" />
            </button>
            <button className={styles.iconBtn} type="button" title="Add member">
              <i className="bi bi-person-plus" />
            </button>

            <div className={styles.headerDivider} />

            <button className={styles.iconBtn} type="button" title="More">
              <i className="bi bi-three-dots" />
            </button>
          </div>
        </header>

        {error ? (
          <div style={{ padding: "8px 14px", fontSize: 13, opacity: 0.95 }}>
            <i className="bi bi-exclamation-triangle" style={{ marginRight: 8 }} />
            {error}
          </div>
        ) : null}

        <section className={styles.thread} ref={threadRef}>
          <div className={styles.dayDivider}>
            <span>Today</span>
          </div>

          {loadingMsgs ? (
            <div className={styles.msgState}>
              <i className={`bi bi-arrow-repeat ${styles.spin}`} />
              <span>Loading messages…</span>
            </div>
          ) : msgs.length === 0 ? (
            <div className={styles.msgState}>
              <i className="bi bi-chat-left-dots" />
              <span>No messages yet</span>
            </div>
          ) : (
            msgs.map((m) => (
              <div
                key={m.id}
                ref={(el) => {
                  msgRefs.current[m.id] = el;
                }}
                className={`${styles.msgRow} ${m.who === "me" ? styles.msgRowMe : styles.msgRowOther}`}
              >
                <div className={styles.msgBubble}>
                  <div className={styles.msgTop}>
                    {m.name && <span className={styles.msgName}>{m.name}</span>}
                    {m.time && <span className={styles.msgTime}>{m.time}</span>}
                  </div>

                  <div className={styles.msgBody}>
                    {m.atAll && (
                      <span className={styles.mention}>
                        <i className="bi bi-at" />
                        All
                      </span>
                    )}
                    <span>{m.text}</span>
                  </div>

                  <div className={styles.msgActions}>
                    <button className={styles.msgIconBtn} type="button" title="React">
                      <i className="bi bi-emoji-smile" />
                    </button>
                    <button className={styles.msgIconBtn} type="button" title="Reply">
                      <i className="bi bi-reply" />
                    </button>
                    <button className={styles.msgIconBtn} type="button" title="More">
                      <i className="bi bi-three-dots" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <footer className={styles.composer}>
          <div className={styles.composerInner}>
            <div className={styles.composerLeft}>
              <textarea
                className={styles.input}
                placeholder={`Message ${activeChat?.title ?? ""}`}
                value={input}
                disabled={!activeChatId || sending}
                rows={1}
                style={{ color: textColor }}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />

              <div className={styles.divRow}>
                <div className={styles.hintRow}>
                  <span className={styles.hintKey}>Enter</span>
                  <span className={styles.hintText}>to send</span>
                </div>
                <div className={styles.tools}>
                  <div className={styles.toolGroup}>
                    <button
                      className={styles.toolBtn}
                      type="button"
                      title="Text color"
                      onClick={() => setShowColorPicker((v) => !v)}
                    >
                      <span className={styles.toolText} style={{ color: textColor }}>
                        Aa
                      </span>
                    </button>
                    <button
                      className={styles.toolBtn}
                      type="button"
                      title="Emoji"
                      onClick={() => setShowEmoji((v) => !v)}
                    >
                      <i className="bi bi-emoji-smile" />
                    </button>

                    <button className={styles.toolBtn} type="button" title="Mention">
                      <i className="bi bi-at" />
                    </button>
                    <button
                      className={styles.toolBtn}
                      type="button"
                      title="Attach link"
                      onClick={() => setShowLinkInput((v) => !v)}
                    >
                      <i className="bi bi-paperclip" />
                    </button>
                  </div>

                  {showColorPicker && (
                    <div className={styles.colorPicker}>
                      {["#111827", "#ef4444", "#22c55e", "#3b82f6", "#a855f7"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={styles.colorDot}
                          style={{ backgroundColor: c }}
                          onClick={() => {
                            setTextColor(c);
                            setShowColorPicker(false);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {showEmoji && (
                    <div className={styles.emojiPicker}>
                      {EMOJIS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          className={styles.emojiBtn}
                          onClick={() => {
                            setInput((prev) => prev + e);
                            setShowEmoji(false);
                          }}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  {showLinkInput && (
                    <div className={styles.linkAttach}>
                      <input
                        className={styles.input}
                        placeholder="Paste link here (https://...)"
                        value={linkValue}
                        onChange={(e) => setLinkValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && linkValue.trim()) {
                            setInput((prev) => prev + " " + linkValue.trim());
                            setLinkValue("");
                            setShowLinkInput(false);
                          }
                        }}
                      />
                    </div>
                  )}

                  <button
                    className={styles.sendBtn}
                    type="button"
                    onClick={send}
                    title="Send"
                    disabled={!input.trim() || !activeChatId || sending}
                  >
                    <i className="bi bi-send-fill" />
                    <span className={styles.sendText}>{sending ? "Sending…" : "Send"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
