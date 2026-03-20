import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage';
import { Message } from '../../types/chat';

describe('ChatMessage Component', () => {
  const mockUserMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello, can you help me find food?',
    timestamp: new Date().toISOString(),
  };

  const mockAssistantMessage: Message = {
    id: '2',
    role: 'assistant',
    content: 'Of course! I can help you search for food listings.',
    timestamp: new Date().toISOString(),
  };

  describe('Basic Rendering', () => {
    it('should render user message with correct styling', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const messageContent = screen.getByText('Hello, can you help me find food?');
      expect(messageContent).toBeInTheDocument();
      const messageBubble = container.querySelector('.bg-blue-600');
      expect(messageBubble).toBeInTheDocument();
    });

    it('should render assistant message with correct styling', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} isUser={false} />);
      const messageContent = screen.getByText('Of course! I can help you search for food listings.');
      expect(messageContent).toBeInTheDocument();
      const messageBubble = container.querySelector('.bg-gray-200');
      expect(messageBubble).toBeInTheDocument();
    });

    it('should display avatar for user message', () => {
      render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const avatar = screen.getByText('You');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('bg-blue-600');
    });

    it('should display avatar for assistant message', () => {
      render(<ChatMessage message={mockAssistantMessage} isUser={false} />);
      const avatar = screen.getByText('AI');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('bg-primary-600');
    });
  });

  describe('Timestamp Display', () => {
    it('should display formatted timestamp', () => {
      const testDate = new Date('2024-01-15T14:30:00Z');
      const message: Message = {
        ...mockUserMessage,
        timestamp: testDate.toISOString(),
      };
      render(<ChatMessage message={message} isUser={true} />);
      // The exact format depends on locale, but it should contain time info
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/);
      expect(timeElements.length).toBeGreaterThan(0);
    });

    it('should handle invalid timestamp gracefully', () => {
      const message: Message = {
        ...mockUserMessage,
        timestamp: 'invalid-date',
      };
      render(<ChatMessage message={message} isUser={true} />);
      // Should not crash and should render the message
      expect(screen.getByText('Hello, can you help me find food?')).toBeInTheDocument();
    });
  });

  describe('Markdown Support', () => {
    it('should render bold text', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'This is **bold** text',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      const boldElement = screen.getByText('bold');
      expect(boldElement.tagName).toBe('STRONG');
      expect(boldElement).toHaveClass('font-semibold');
    });

    it('should render italic text', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'This is _italic_ text',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      const italicElement = screen.getByText('italic');
      expect(italicElement.tagName).toBe('EM');
      expect(italicElement).toHaveClass('italic');
    });

    it('should render links', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'Check out [this link](https://example.com)',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      const linkElement = screen.getByText('this link');
      expect(linkElement.tagName).toBe('A');
      expect(linkElement).toHaveAttribute('href', 'https://example.com');
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render inline code', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'Use the `filter` function to search',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      const codeElement = screen.getByText('filter');
      expect(codeElement.tagName).toBe('CODE');
      expect(codeElement).toHaveClass('bg-gray-200');
    });

    it('should handle multiple markdown formats in one message', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'Use **bold** and _italic_ with `code` and [links](https://example.com)',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      expect(screen.getByText('bold')).toHaveClass('font-semibold');
      expect(screen.getByText('italic')).toHaveClass('italic');
      expect(screen.getByText('code')).toHaveClass('bg-gray-200');
      expect(screen.getByText('links')).toHaveAttribute('href', 'https://example.com');
    });

    it('should preserve line breaks', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'Line 1\nLine 2\nLine 3',
        timestamp: new Date().toISOString(),
      };
      const { container } = render(<ChatMessage message={message} isUser={false} />);
      const lines = container.querySelectorAll('div[role="article"] div > div > div > div');
      // Should have multiple line divs
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'Your message');
    });

    it('should have proper ARIA labels for assistant', () => {
      render(<ChatMessage message={mockAssistantMessage} isUser={false} />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'Assistant message');
    });

    it('should have aria-hidden on avatar', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const avatar = container.querySelector('[aria-hidden="true"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should have aria-label on timestamp', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const timestamp = container.querySelector('[aria-label*="Sent at"]');
      expect(timestamp).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should reverse flex direction for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const messageContainer = container.querySelector('[role="article"]');
      expect(messageContainer).toHaveClass('flex-row-reverse');
    });

    it('should use normal flex direction for assistant messages', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} isUser={false} />);
      const messageContainer = container.querySelector('[role="article"]');
      expect(messageContainer).toHaveClass('flex-row');
    });

    it('should apply correct text alignment for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} isUser={true} />);
      const contentDiv = container.querySelector('[role="article"] > div:last-child');
      expect(contentDiv).toHaveClass('text-right');
    });

    it('should apply correct text alignment for assistant messages', () => {
      const { container } = render(<ChatMessage message={mockAssistantMessage} isUser={false} />);
      const contentDiv = container.querySelector('[role="article"] > div:last-child');
      expect(contentDiv).toHaveClass('text-left');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message content', () => {
      const message: Message = {
        ...mockUserMessage,
        content: '',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={true} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longContent = 'This is a very long message. '.repeat(50);
      const message: Message = {
        ...mockAssistantMessage,
        content: longContent,
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      expect(screen.getByText(new RegExp(longContent.substring(0, 20)))).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const message: Message = {
        ...mockUserMessage,
        content: 'Special chars: & < > " \'',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={true} />);
      expect(screen.getByText(/Special chars:/)).toBeInTheDocument();
    });

    it('should handle nested markdown-like patterns', () => {
      const message: Message = {
        ...mockAssistantMessage,
        content: 'Text with **bold *and italic* inside** bold',
        timestamp: new Date().toISOString(),
      };
      render(<ChatMessage message={message} isUser={false} />);
      // Should render without crashing
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });
});
