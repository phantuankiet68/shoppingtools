"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/profile/messages.module.css";

type ChatItem = {
  id: string;
  title: string;
  lastSender: string;
  lastText: string;
  pinned?: boolean;
  unread?: number;
};

type Msg = {
  id: string;
  who: "other" | "me";
  name?: string;
  text: string;
  atAll?: boolean;
  time?: string;
};

export default function AdminMessagesClient() {
  const chats: ChatItem[] = useMemo(
    () => [
      {
        id: "c1",
        title: "Content project",
        lastSender: "Ashley",
        lastText: "@All please finish the weekly report by the end of Thursday",
        pinned: true,
      },
    ],
    []
  );

  const messagesByChat: Record<string, Msg[]> = useMemo(
    () => ({
      c1: [
        {
          id: "m1",
          who: "other",
          name: "Ashley",
          text: "please finish the weekly report by the end of Thursday",
          atAll: true,
        },
      ],
    }),
    []
  );

  const [activeChatId, setActiveChatId] = useState(chats[0]?.id ?? "");
  const [input, setInput] = useState("");

  const activeChat = chats.find((c) => c.id === activeChatId);
  const msgs = messagesByChat[activeChatId] ?? [];

  function send() {
    if (!input.trim()) return;
    // Demo UI thôi (bạn nối API sau)
    setInput("");
  }

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

          <button className={styles.newChatBtn} type="button" title="New chat">
            <i className="bi bi-plus-lg" />
          </button>
        </div>

        {/* Search */}
        <div className={styles.sidebarTools}>
          <div className={styles.searchBox}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input className={styles.searchInput} placeholder="Search chats…" />
            <button className={styles.searchAction} type="button" title="Filter">
              <i className="bi bi-sliders" />
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.tabActive}`} type="button">
              All
            </button>
            <button className={styles.tab} type="button">
              Unread
            </button>
            <button className={styles.tab} type="button">
              Pinned
            </button>
          </div>
        </div>

        <div className={styles.chatList}>
          {chats.map((c) => {
            const active = c.id === activeChatId;
            const unread = (c as any).unread ?? 0;

            return (
              <button key={c.id} className={`${styles.chatRow} ${active ? styles.chatRowActive : ""}`} onClick={() => setActiveChatId(c.id)} type="button">
                <div className={styles.chatAvatar}>
                  <i className="bi bi-people" />
                  <span className={styles.chatOnlineDot} />
                </div>

                <div className={styles.chatMeta}>
                  <div className={styles.chatTopLine}>
                    <div className={styles.chatName}>{c.title}</div>

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
                    <span className={styles.chatSender}>{c.lastSender}:</span>
                    <span className={styles.chatText}>{c.lastText}</span>
                  </div>
                </div>

                <span className={styles.chatChevron}>
                  <i className="bi bi-chevron-right" />
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
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
                  <span>8 members</span>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconBtn} type="button" title="Search">
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

        {/* Thread */}
        <section className={styles.thread}>
          <div className={styles.dayDivider}>
            <span>Today</span>
          </div>

          {msgs.map((m) => (
            <div key={m.id} className={`${styles.msgRow} ${m.who === "me" ? styles.msgRowMe : styles.msgRowOther}`}>
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
          ))}
        </section>

        {/* Composer */}
        <footer className={styles.composer}>
          <div className={styles.composerInner}>
            <div className={styles.composerLeft}>
              <input
                className={styles.input}
                placeholder={`Message ${activeChat?.title ?? ""}`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <div className={styles.hintRow}>
                <span className={styles.hintKey}>Enter</span>
                <span className={styles.hintText}>to send</span>
                <span className={styles.hintDot}>•</span>
                <span className={styles.hintKey}>Shift</span>
                <span className={styles.hintPlus}>+</span>
                <span className={styles.hintKey}>Enter</span>
                <span className={styles.hintText}>new line</span>
              </div>
            </div>

            <div className={styles.tools}>
              <div className={styles.toolGroup}>
                <button className={styles.toolBtn} type="button" title="Formatting">
                  <span className={styles.toolText}>Aa</span>
                </button>
                <button className={styles.toolBtn} type="button" title="Emoji">
                  <i className="bi bi-emoji-smile" />
                </button>
                <button className={styles.toolBtn} type="button" title="Mention">
                  <i className="bi bi-at" />
                </button>
                <button className={styles.toolBtn} type="button" title="Attach">
                  <i className="bi bi-paperclip" />
                </button>
              </div>

              <button className={styles.sendBtn} type="button" onClick={send} title="Send">
                <i className="bi bi-send-fill" />
                <span className={styles.sendText}>Send</span>
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
