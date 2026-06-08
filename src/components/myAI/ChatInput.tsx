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
      className="relative flex items-end gap-2 p-2 rounded-xl border bg-background/55 dark:bg-card/40 backdrop-blur-md focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300"
    >
      <Textarea
        placeholder="Type a message or paste some text..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="min-h-[44px] max-h-[200px] flex-1 border-0 bg-transparent px-3 py-2.5 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 outline-none resize-none shadow-none text-sm leading-relaxed"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !value.trim()}
        className="size-8.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all shrink-0 active:scale-95 disabled:scale-100 disabled:opacity-40"
      >
        <ArrowUp className="size-4" />
      </Button>
    </form>
  );
};
