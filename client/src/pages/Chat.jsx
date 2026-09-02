import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../services/api";
import "./Chat.css";

const Chat = () => {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const profileRef = useRef(null);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchConversations();
    fetchProfile();
  }, [navigate]);

  // =========================
  // CLOSE PROFILE DROPDOWN
  // =========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // AUTO SCROLL
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending]);

  // =========================
  // FETCH PROFILE
  // =========================
  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/me");

      const profile = response.data.user || response.data.data || response.data;

      setUser(profile);
    } catch (error) {
      console.error("Profile error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // =========================
  // FETCH CONVERSATIONS
  // =========================
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      setError("");

      const response = await api.get("/conversations");

      const updatedConversations = response.data.conversations || [];

      setConversations(updatedConversations);

      if (selectedConversation) {
        const updatedSelectedConversation = updatedConversations.find(
          (conversation) => conversation._id === selectedConversation._id,
        );

        if (updatedSelectedConversation) {
          setSelectedConversation(updatedSelectedConversation);
        }
      }
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to load conversations.",
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  // =========================
  // CREATE NEW CONVERSATION
  // =========================
  const createNewConversation = async () => {
    try {
      setError("");

      const response = await api.post("/conversations");

      const newConversation = response.data.conversation;

      setConversations((prev) => [newConversation, ...prev]);

      setSelectedConversation(newConversation);
      setMessages([]);
      setInput("");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message || "Unable to create conversation.",
      );
    }
  };

  // =========================
  // SELECT CONVERSATION
  // =========================
  const selectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setLoadingMessages(true);
      setMessages([]);
      setInput("");
      setError("");

      const response = await api.get(`/messages/${conversation._id}`);

      setMessages(response.data.messages || []);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(error.response?.data?.message || "Unable to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || !selectedConversation || sending) {
      return;
    }

    const content = input.trim();

    try {
      setSending(true);
      setError("");

      const response = await api.post(`/messages/${selectedConversation._id}`, {
        content,
      });

      const userMessage = response.data.userMessage;
      const assistantMessage = response.data.assistantMessage;

      const updatedConversation = response.data.conversation;

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      setInput("");

      if (updatedConversation) {
        setSelectedConversation(updatedConversation);

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation._id === updatedConversation._id
              ? updatedConversation
              : conversation,
          ),
        );
      }
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(error.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // =========================
  // PROFILE INITIALS
  // =========================
  const getInitials = () => {
    if (!user) return "U";

    if (user.name) {
      return user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }

    if (user.email) {
      return user.email[0].toUpperCase();
    }

    return "U";
  };

  return (
    <div className="chat-page">
      {/* ================= SIDEBAR ================= */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">AI</div>

            <div>
              <h2>AI Chat</h2>
              <span>Personal Assistant</span>
            </div>
          </div>

          <button
            type="button"
            className="new-chat-button"
            onClick={createNewConversation}
          >
            <span className="new-chat-icon">+</span>
            New Chat
          </button>
        </div>

        <div className="conversation-section">
          <div className="conversation-heading">
            <span>Your conversations</span>
          </div>

          <div className="conversation-list">
            {loadingConversations ? (
              <p className="sidebar-message">Loading chats...</p>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">
                <div className="no-chat-icon">✦</div>
                <p>No conversations yet</p>
                <span>Start a new chat to begin.</span>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conversation._id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <span className="conversation-icon">◇</span>

                  <span className="conversation-title">
                    {conversation.title || "New Chat"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Sidebar footer */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="sidebar-avatar">{getInitials()}</div>

            <div className="sidebar-profile-info">
              <strong>{user?.name || "User"}</strong>

              <span>{user?.email || "Account"}</span>
            </div>

            <span className="sidebar-arrow">›</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CHAT ================= */}
      <main className="chat-main">
        {/* ================= HEADER ================= */}
        <header className="chat-header">
          <div className="chat-title-area">
            <div className="ai-status">
              <span className="status-dot"></span>
            </div>

            <div>
              <h1>{selectedConversation?.title || "AI Assistant"}</h1>

              <span className="chat-status">AI Assistant</span>
            </div>
          </div>

          {/* ================= PROFILE ================= */}
          <div className="profile-container" ref={profileRef}>
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Open profile menu"
            >
              <div className="profile-avatar">{getInitials()}</div>

              <div className="profile-user">
                <strong>{user?.name || "User"}</strong>

                <span>Account</span>
              </div>

              <span className={`profile-chevron ${profileOpen ? "open" : ""}`}>
                ⌄
              </span>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-menu-avatar">{getInitials()}</div>

                  <div>
                    <strong>{user?.name || "User"}</strong>

                    <span>{user?.email || "No email available"}</span>
                  </div>
                </div>

                <div className="profile-divider"></div>

                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <span>Account</span>
                  <span>›</span>
                </button>

                <button
                  type="button"
                  className="profile-menu-item logout-item"
                  onClick={logout}
                >
                  <span>Log out</span>
                  <span>↪</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ================= MESSAGES ================= */}
        <section className="messages-container">
          {!selectedConversation ? (
            <div className="empty-chat">
              <div className="welcome-icon">✦</div>

              <h2>How can I help you?</h2>

              <p>Start a conversation and ask anything you need.</p>

              <button type="button" onClick={createNewConversation}>
                <span>+</span>
                Start New Chat
              </button>
            </div>
          ) : loadingMessages ? (
            <div className="empty-chat">
              <div className="loading-spinner"></div>
              <p>Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <div className="welcome-icon">✦</div>

              <h2>How can I help you?</h2>

              <p>Send your first message to start the conversation.</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`message-row ${message.role}`}
                >
                  {message.role === "assistant" && (
                    <div className="assistant-avatar">AI</div>
                  )}

                  <div className="message-content">
                    <div className="message-name">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </div>

                    <div className="message-bubble">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="message-row assistant">
                  <div className="assistant-avatar">AI</div>

                  <div className="message-content">
                    <div className="message-name">AI Assistant</div>

                    <div className="message-bubble typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {/* ================= ERROR ================= */}
        {error && <div className="chat-error">{error}</div>}

        {/* ================= MESSAGE INPUT ================= */}
        <div className="input-area">
          <form className="message-form" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder={
                selectedConversation
                  ? "Message AI Assistant..."
                  : "Start a conversation first"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selectedConversation || sending}
            />

            <button
              type="submit"
              className="send-button"
              disabled={!selectedConversation || !input.trim() || sending}
              aria-label="Send message"
            >
              {sending ? (
                <span className="send-loading">...</span>
              ) : (
                <span className="send-icon">↑</span>
              )}
            </button>
          </form>

          <p className="input-disclaimer">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Chat;
