// @component/myAI/ChatMessage.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { Button } from "@components/components/ui/button";
import { cn } from "@components/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-border/50 shadow-sm bg-[#1e1e1e] dark:bg-[#121212] font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] dark:bg-[#1a1a1a] text-xs text-zinc-300 border-b border-zinc-700/50">
        <span className="font-semibold select-none">{language || "code"}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1 rounded transition-colors text-[11px] font-sans cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy code</span>
            </>
          )}
        </Button>
      </div>
      {/* Code syntax highlight body */}
      <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed">
        <SyntaxHighlighter
          language={language || "text"}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "inherit",
          }}
          PreTag="div"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

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
          isAi ? "w-full items-start" : "max-w-[90%] md:max-w-[85%] items-end"
        )}
      >
        {/* Teks Konten Utama */}
        <div
          className={cn(
            "text-[17px] sm:text-base break-words font-desc text-foreground/90 antialiased",
            isAi
              ? "leading-relaxed w-full pt-1 whitespace-normal"
              : "leading-relaxed bg-muted/60 dark:bg-muted/30 px-5 py-3 rounded-3xl rounded-tr-sm text-foreground/90 whitespace-pre-wrap"
          )}
        >
          {isAi ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Paragraph: jarak standar premium agar tidak menempel
                p: ({ node, ...props }) => (
                  <p className="mb-4 last:mb-0 leading-relaxed text-[15.5px] sm:text-base font-desc text-foreground/90" {...props} />
                ),

                // Lists: Indentasi & spacing yang pas
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-5 mb-4 space-y-1.5 font-desc" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-5 mb-4 space-y-1.5 font-desc" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed text-[15.5px] sm:text-base text-foreground/90 pl-0.5" {...props} />
                ),

                // Headings: tebal & jarak pas
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-3 first:mt-0" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mt-5 mb-2.5 first:mt-0" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mt-4 mb-2 first:mt-0" {...props} />
                ),

                // Tables: Desain responsive premium
                table: ({ node, ...props }) => (
                  <div className="w-full overflow-x-auto my-4 rounded-xl border border-border/50 shadow-sm">
                    <table className="w-full border-collapse text-sm text-left text-foreground/95" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground border-b border-border/50" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-border/40" {...props} />
                ),
                tr: ({ node, ...props }) => (
                  <tr className="hover:bg-muted/10 even:bg-muted/5 transition-colors" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-4 py-3 font-semibold border-r border-border/30 last:border-0" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-4 py-2.5 border-r border-border/30 last:border-0 align-top" {...props} />
                ),

                // Blockquotes
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4 font-desc" {...props} />
                ),

                // Horizontal Rule
                hr: ({ node, ...props }) => (
                  <hr className="my-6 border-t border-border/50" {...props} />
                ),

                // Bold
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-foreground" {...props} />
                ),

                // Code handler (inline vs block)
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const codeValue = String(children).replace(/\n$/, '');

                  if (match) {
                    return <CodeBlock language={language} value={codeValue} />;
                  }

                  return (
                    <code className="bg-muted/80 dark:bg-muted/50 px-1.5 py-0.5 rounded font-mono text-[13.5px] text-foreground/90 font-medium" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            message.content
          )}
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