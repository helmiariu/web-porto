// @component/myAI/ChatContainer
import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { type Message } from "./ChatMessage";
import { Trash2, Shield, RefreshCw, Radio } from "lucide-react";
import { Button } from "@components/components/ui/button";

// Definisikan URL Cloudflare Worker (Pastikan diisi dengan URL aslimu saat deploy selesai)
const WORKER_API_URL = import.meta.env.PUBLIC_GEMINI_WORKER_URL || "https://gemini-proxy-worker.helmi.workers.dev";

// INITIAL_MESSAGES tetap dipertahankan jika sewaktu-waktu butuh data demo
const INITIAL_MESSAGES: Message[] = [
  // ... (isi INITIAL_MESSAGES biarkan sama seperti kodemu sebelumnya)
  {
    id: "1",
    role: "ai",
    content: "Hi there! I am your personal AI Assistant. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  }
];

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // UBAH DI SINI: Fungsi handleSendMessage sekarang terhubung ke Worker backend
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
      // 2. Kirim riwayat pesan ke proxy Cloudflare Worker
      const response = await fetch(WORKER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika terkena Rate Limit (HTTP 429) atau error lainnya
        throw new Error(data.error || "Gagal mendapatkan respon dari AI.");
      }

      // 3. Tambahkan pesan AI ke chat history
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      // 4. Handle error & rate limit dengan menampilkan pesan peringatan di chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `⚠️ Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
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
            <h1 className="text-xl md:text-2xl font-medium text-muted-foreground/60 tracking-wide text-center px-4">
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
          : "pb-16 md:pb-6 pt-2" // Input turun ke dasar (pb-16 di HP, pb-6 di Desktop)
          }`}
      >
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground/60 transition-opacity duration-500">
            <Shield className="size-3" />
            <span>Privacy first: Your messages are not stored.</span>
          </div>
        </div>
      </div>

    </div>
  );
};