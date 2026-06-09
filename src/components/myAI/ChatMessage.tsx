// @component/myAI/ChatMessage.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@components/components/ui/button";
import { cn } from "@components/lib/utils";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = React.useState(false);
  const isAi = message.role === "ai";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formattedTime = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full py-3 sm:py-4 transition-all duration-300 group",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      {/* Container Pembungkus Pesan */}
      <div
        className={cn(
          "flex flex-col gap-1 min-w-0",
          // Lebar penuh untuk AI agar terasa seperti dokumen/artikel, 
          // sementara User tetap dibatasi sebagai gelembung percakapan.
          isAi ? "w-full items-start" : "max-w-[90%] md:max-w-[85%] items-end"
        )}
      >
        {/* Teks Konten Utama */}
        <div
          className={cn(
            "text-[15px] sm:text-base whitespace-pre-wrap break-words font-desc font-medium text-foreground/90 antialiased",
            isAi
              ? "leading-relaxed sm:leading-7 w-full pt-1" // Gaya AI: Teks polos renggang
              : "leading-relaxed bg-muted/60 dark:bg-muted/30 px-5 py-3 rounded-3xl rounded-tr-sm text-foreground/90" // Gaya User: Gelembung membulat abu-abu
          )}
        >
          {message.content}
        </div>

        {/* Aksi Copy & Waktu (Muncul saat hover) */}
        <div className={cn(
          "flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isAi ? "justify-start" : "justify-end"
        )}>
          {isAi && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="size-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 rounded-md transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </Button>
          )}
          <span className="text-[10px] text-muted-foreground/40 font-medium px-1">
            {formattedTime}
          </span>
        </div>

      </div>
    </motion.div>
  );
};