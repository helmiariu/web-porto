import * as React from "react";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { type Message } from "./ChatMessage";
import { Trash2, Shield, RefreshCw, Radio } from "lucide-react";
import { Button } from "@components/components/ui/button";

// INITIAL_MESSAGES tetap dipertahankan jika sewaktu-waktu butuh data demo
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content: "Hi there! I am your personal AI Assistant. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "2",
    role: "user",
    content: "Can you help me design a minimalist dashboard layout?",
    timestamp: new Date(Date.now() - 1000 * 60 * 14),
  },
  {
    id: "3",
    role: "ai",
    content: "Of course! A minimalist dashboard focuses on high-contrast typography, generous whitespace, subtle borders (such as border-border/40), and functional color accents.\n\nHere are some best practices:\n• Keep the navigation clean and collapsable.\n• Group similar items together into borderless or softly bordered cards.\n• Highlight important metrics using large, bold typefaces.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: "4",
    role: "user",
    content: "That makes sense. What color palette should I use? I want it to feel modern but not too cold.",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: "5",
    role: "ai",
    content: "For a modern, warm minimalist feel, I recommend a neutral base with a subtle warm undertone. Try using off-whites (like `zinc-50` or `stone-50` in Tailwind) for backgrounds, dark slate for primary text, and a single muted accent color like sage green or dusty blue for interactive elements like buttons and active links.",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
  },
  {
    id: "6",
    role: "user",
    content: "Oh, dusty blue sounds nice. How do I handle data tables? They usually look so cluttered.",
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
  },
  {
    id: "7",
    role: "ai",
    content: "Great question! Data tables are tricky. To keep them minimalist:\n\n1. Remove vertical borders entirely.\n2. Use very faint horizontal borders (e.g., `border-gray-100` or `border-border/20`).\n3. Align text to the left and numbers to the right.\n4. Use adequate padding (like `p-4`) so the data breathes.\n\nWould you like me to generate a quick React component example for that table?",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: "8",
    role: "user",
    content: "Yes please! And make sure it uses Lucide React icons for the table actions.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: "9",
    role: "ai",
    content: "I can definitely help with that! You can use icons like `MoreHorizontal` for a minimalist action menu, or `Edit2` and `Trash2` for direct actions. Just let me know when you are ready to write the code!",
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
  }
];

export const ChatContainer: React.FC = () => {
  // 1. UBAH DI SINI: Inisialisasi state dengan array kosong []
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

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      let aiText = "I received your message. How else can I assist you with your Astro or React project?";

      const query = content.toLowerCase();
      if (query.includes("hello") || query.includes("hi")) {
        aiText = "Hello! Hope you are having an amazing day. What are we building today?";
      } else if (query.includes("astro")) {
        aiText = "Astro.js is fantastic for content-driven websites. By utilizing islands architecture, you can keep your pages fast while using React, Vue, or Svelte only where necessary!";
      } else if (query.includes("react")) {
        aiText = "React is perfect for stateful interactions like this chat interface. Using hooks like `useState` and `useRef` enables dynamic UI updates without page reloads.";
      } else if (query.includes("tailwind")) {
        aiText = "Tailwind CSS allows for rapid styling with utility classes. In minimalist designs, focus on using semantic spacing values and OKLCH color palettes for a highly premium feel.";
      } else if (query.includes("design") || query.includes("table") || query.includes("code")) {
        aiText = "Great design is subtraction. Try to reduce visual noise by using spacing instead of lines, using lighter text for secondary details, and emphasizing interactive states.";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const isChatEmpty = messages.length === 0;

  return (
    <div
      className={`flex flex-col w-full overflow-hidden transition-all duration-500 ease-in-out ${isChatEmpty
        ? "h-[50dvh] my-auto" // Tampilan saat kosong (50dvh, di tengah)
        : "h-[100dvh]" // Tampilan saat ada chat (Penuh)
        }`}
    >
      {/* Chat Header (Tetap di atas) */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-3 rounded-full bg-emerald-500">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">myAI Playground</h2>
            <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-mono">
              <Radio className="size-2.5 text-emerald-500" />
              Active Node • Latency ~12ms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="size-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              title="Clear chat"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetChat}
              className="size-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 rounded-lg transition-all"
              title="Load demo chat" // 2. UBAH DI SINI: Ganti tooltip agar lebih masuk akal
            >
              <RefreshCw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Area Tengah */}
      <div className="flex-1 px-6 py-4 overflow-y-auto flex flex-col">
        {/* 3. CATATAN PENTING: Karena sebelumnya Anda membuat UI Kosong yang keren (dengan icon CPU) di dalam ChatHistory.tsx, kita cukup memanggil ChatHistory secara langsung di sini tanpa ternary isChatEmpty lagi di area ini. */}
        <ChatHistory
          messages={messages}
          bottomRef={bottomRef}
          isLoading={isLoading}
        />
      </div>

      {/* Chat Input (Tetap di bawah) */}
      <div className="shrink-0 p-4 border-t border-border/40 bg-background z-10">
        {/* TAMBAHKAN PEMBUNGKUS INI UNTUK MENGATUR LEBAR */}
        <div className="max-w-2xl mx-auto w-full">
          <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />

          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] text-muted-foreground/50">
            <Shield className="size-3" />
            <span>Responses are mocked. Data is processed locally.</span>
          </div>
        </div>
      </div>
    </div>

  );
};