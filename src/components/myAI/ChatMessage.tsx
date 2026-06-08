import * as React from "react";
import { motion } from "framer-motion";
import { Bot, User, Copy, Check, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@components/components/ui/avatar";
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
        "flex w-full gap-4 p-4 rounded-2xl transition-all duration-300",
        isAi
          ? "bg-muted/30 dark:bg-card/25 border border-border/40 hover:border-border/80"
          : "bg-primary/[0.03] dark:bg-primary/[0.01] border border-primary/10 hover:border-primary/20 flex-row-reverse"
      )}
    >
      <Avatar className={cn("size-9 border shadow-xs select-none shrink-0")}>
        {isAi ? (
          <>
            <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="bg-secondary text-secondary-foreground border">
              <User className="size-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className={cn("flex items-center gap-2", isAi ? "justify-start" : "justify-end")}>
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground/80">
            {isAi ? "AI Assistant" : "You"}
          </span>
          {isAi && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full dark:bg-primary/20">
              <Sparkles className="size-2.5" />
              Pro
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60">{formattedTime}</span>
        </div>

        <div
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap break-words font-desc text-foreground/90",
            !isAi && "text-right"
          )}
        >
          {message.content}
        </div>

        <div className={cn("flex mt-1", isAi ? "justify-start" : "justify-end")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="size-7 text-muted-foreground/50 hover:text-foreground hover:bg-muted/80 rounded-md transition-colors"
            title="Copy message"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
