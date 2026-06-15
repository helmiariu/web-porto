// @component/myAI/ChatContainer.tsx
import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { type Message } from "./ChatMessage";
import { Trash2, Shield, RefreshCw, Radio } from "lucide-react";
import { Button } from "@components/components/ui/button";

// Karena sudah direfactor ke Pages Functions, cukup gunakan relative path lokal
const AI_CHAT_API_URL = "/api/ai-chat";

// INITIAL_MESSAGES tetap dipertahankan jika sewaktu-waktu butuh data demo
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Hi there! I am your personal AI Assistant. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  }
];

const STORAGE_KEY = "myai_chat_history";
const SESSION_KEY = "myai_chat_session_id";

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
      } catch (error) {
        console.error("Failed to load chat history from sessionStorage:", error);
      }
    }
    return [];
  });
  const [sessionId, setSessionId] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  // Auto-save messages to sessionStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history to sessionStorage:", error);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Sinkronisasi riwayat chat dengan database D1 (GET)
  React.useEffect(() => {
    const fetchChatHistory = async () => {
      const activeSessionId = sessionId || getOrCreateSessionId();
      if (!activeSessionId) return;

      try {
        const res = await fetch(`${AI_CHAT_API_URL}?sessionId=${activeSessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            const formatted = data.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(formatted);
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi riwayat chat dengan D1:", err);
      }
    };

    if (sessionId) {
      fetchChatHistory();
    }
  }, [sessionId]);

  // Fungsi handleSendMessage sekarang terhubung langsung ke Pages Functions lokal
  const handleSendMessage = async (content: string) => {
    // 1. Buat pesan user baru
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    // Update state pesan dengan input user
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // 2. Kirim riwayat pesan ke endpoint internal
      const response = await fetch(AI_CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId || getOrCreateSessionId(),
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        let errorMsg = "Gagal mendapatkan respon dari AI.";
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch (e) {
          // Abaikan jika bukan JSON
        }
        const error = new Error(errorMsg);
        (error as any).status = response.status;
        throw error;
      }

      // Check jika server mengembalikan JSON (misal rate limit/error fallback)
      const contentType = response.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.content || "",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      // Membaca stream text
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Gagal membaca body respon stream dari server.");
      }

      // 3. Buat template pesan AI kosong terlebih dahulu
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "ai",
        content: "",
        timestamp: new Date(),
      };

      // Tambahkan pesan kosong ke chat history
      setMessages((prev) => [...prev, aiMessage]);

      const decoder = new TextDecoder("utf-8");
      let streamContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamContent += chunk;

        // Perbarui konten AI secara real-time
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: streamContent } : msg
          )
        );
      }

    } catch (error: any) {
      // 4. Handle error UX feedback berdasarkan status code
      let feedbackMessage = `⚠️ Error: ${error.message}`;

      if (error.status === 429) {
        // Tampilan khusus untuk Rate Limit (UX lebih ramah)
        feedbackMessage = `⏳ ${error.message}`;
      } else if (error.status >= 500) {
        // Tampilan khusus untuk Server Error
        feedbackMessage = `🛠️ Terjadi gangguan pada server. Mohon coba beberapa saat lagi.`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: feedbackMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    const activeSessionId = sessionId || getOrCreateSessionId();

    // Optimistic UI update: hapus di frontend & session storage terlebih dahulu
    setMessages([]);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "[]");
    }

    try {
      // Panggil DELETE API ke backend untuk mencatat timestamp clear (soft clear) di KV
      await fetch(`${AI_CHAT_API_URL}?sessionId=${activeSessionId}`, {
        method: "DELETE",
      });

      // Generate sessionId baru untuk memisahkan ke thread percakapan baru
      if (typeof window !== "undefined") {
        const newId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem(SESSION_KEY, newId);
        setSessionId(newId);
      }
    } catch (err) {
      console.error("Gagal melakukan soft-clear percakapan pada backend:", err);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const isChatEmpty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-[850px] overflow-hidden bg-background px-4 md:px-0">

      {/* --- Chat Header --- */}
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-3 rounded-full bg-emerald-500">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">myAI Playground</h2>
            <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-mono">
              <Radio className="size-2.5 text-emerald-500" /> Active Node • Latency ~12ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 ? (
            <Button variant="ghost" size="icon" onClick={handleClearChat} className="size-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Clear chat">
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleResetChat} className="size-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 rounded-lg transition-all" title="Load demo chat">
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* --- Area Tengah --- */}
      <div className="flex-1 flex flex-col min-h-0">
        {isChatEmpty ? (
          <div className="flex-1 flex flex-col justify-end items-center pb-10 animate-in fade-in duration-700">
            <h1 className="text-xl md:text-2xl font-medium text-muted-foreground/90 tracking-wide text-center px-4">
              Ask me anything about Helmi.
            </h1>
          </div>
        ) : (
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 flex-1 flex flex-col mt-2 md:mt-4 min-h-0">
            <ChatHistory messages={messages} bottomRef={bottomRef} isLoading={isLoading} />
          </div>
        )}
      </div>

      {/* --- Chat Input --- */}
      <div
        className={`shrink-0 z-10 bg-background transition-all duration-500 ease-in-out ${isChatEmpty
          ? "pb-[45dvh] pt-0" // Input naik ke tengah
          : "pb-16 md:pb-6 pt-2" // Input turun ke dasar
          }`}
      >
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground/90 transition-opacity duration-500">
            <Shield className="size-3" />
            <span>Messages are securely encrypted and stored.</span>
          </div>
        </div>
      </div>

    </div>
  );
};