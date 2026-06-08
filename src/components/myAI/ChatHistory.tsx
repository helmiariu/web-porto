// src/components/myAI/ChatHistory.tsx
import * as React from "react";
import { ScrollArea } from "@components/components/ui/scroll-area";
import { ChatMessage, type Message } from "./ChatMessage";
import { Cpu } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 w-fit h-6 px-1">
      <div className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="size-1.5 rounded-full bg-foreground/40 animate-bounce"></div>
    </div>
  );
};

interface ChatHistoryProps {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  bottomRef,
  isLoading,
}) => {

  // 1. KONDISI KOSONG: Render div biasa agar Flexbox bekerja 100% sempurna
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-end flex-1 w-full h-full pb-2 mt-auto">
        <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
          <p className="text-xl font-medium text-muted-foreground/60 tracking-wide">
            Ask me anything about Helmi.
          </p>
        </div>
      </div>
    );
  }

  // 2. KONDISI ADA PESAN: Gunakan ScrollArea
  return (
    <ScrollArea className="flex-1 w-full pr-1.5 min-h-0">
      <div className="flex flex-col gap-6 py-4 px-1 min-h-full">

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex gap-4 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
            <div className="size-9 rounded-full bg-muted/50 flex items-center justify-center border border-border/40 select-none shrink-0">
              <Cpu className="size-5 text-muted-foreground/50" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="w-fit rounded-2xl rounded-tl-sm px-4 py-2 bg-muted/30 dark:bg-card/25 border border-border/40">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  );
};