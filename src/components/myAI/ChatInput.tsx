// @component/myAI/ChatInput
import * as React from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@components/components/ui/textarea";
import { Button } from "@components/components/ui/button";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
}) => {
  const [value, setValue] = React.useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!value.trim() || disabled) return;
    onSendMessage(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-1.5 rounded-2xl border border-border/50 bg-muted/60 dark:bg-muted/60 shadow-sm hover:border-border/80 focus-within:bg-background dark:focus-within:bg-background focus-within:border-primary/40 focus-within:shadow-md transition-all duration-300"
    >
      <Textarea
        placeholder="Type a message or paste some text..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        // Tambahkan tanda seru (!) pada text size, font family, dan line-height
        className="min-h-[44px] max-h-[200px] flex-1 border-0 bg-transparent px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 outline-none resize-none shadow-none !text-[15px] sm:!text-base !font-desc text-foreground/90 !leading-relaxed placeholder:text-muted-foreground/50"
      />

      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        className="size-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shrink-0 active:scale-95 disabled:scale-100 disabled:opacity-40 mb-0.5 mr-0.5"
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  );
};