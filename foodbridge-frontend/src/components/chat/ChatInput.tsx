import React, { useState, useRef, useEffect } from 'react';
import Button from '../shared/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/**
 * ChatInput Component
 * 
 * Provides text input with send button for chat messages.
 * Handles Enter key to send, Shift+Enter for newline.
 * Disables input during loading.
 * 
 * Requirements:
 * - Implement text input with send button (Requirement 10.3)
 * - Handle Enter key to send
 * - Disable during loading
 */
const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmedMessage = input.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, but allow Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message... (Shift+Enter for newline)"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none overflow-hidden disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        aria-label="Chat message input"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        size="md"
        variant="primary"
        aria-label="Send message"
      >
        Send
      </Button>
    </div>
  );
};

export default ChatInput;
