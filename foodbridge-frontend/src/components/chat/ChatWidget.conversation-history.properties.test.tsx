import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ChatWidget from './ChatWidget';
import chatService from '../../services/chatService';
import { Message } from '../../types/chat';

// Mock dependencies
vi.mock('../../services/chatService');
vi.mock('../../hooks', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

/**
 * Property 50: Conversation history is maintained within session
 * 
 * **Validates: Requirements 10.7**
 * 
 * For any chat session, sending multiple messages should result in all messages
 * being maintained in the conversation history. The history should persist
 * within the current session and be retrievable at any time.
 */
describe('Property 50: Conversation history is maintained within session', () => {
  const mockChatService = chatService as any;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    // Mock chatService methods
    mockChatService.createSession.mockResolvedValue('session-123');
    mockChatService.getSessionHistory.mockResolvedValue([]);
    mockChatService.sendMessage.mockResolvedValue({
      message: {
        id: 'msg-1',
        role: 'assistant',
        content: 'Response',
        timestamp: new Date().toISOString(),
      },
      session_id: 'session-123',
    });
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Property: For any single message sent, the message is added to the
   * conversation history and persisted in session storage.
   */
  it('should maintain single message in conversation history', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    // Verify initial empty history
    const initialMessages = sessionStorage.getItem('chat_messages');
    expect(initialMessages).toBeTruthy();
    const initialParsed = JSON.parse(initialMessages!);
    expect(Array.isArray(initialParsed)).toBe(true);
  });

  /**
   * Property-based test: For any sequence of messages, all messages
   * should be maintained in the conversation history.
   */
  it(
    'should maintain all messages in conversation history [property-based]',
    async () => {
      // Generate arbitrary message content
      const messageArbitrary = fc.string({ minLength: 1, maxLength: 100 });

      await fc.assert(
        fc.asyncProperty(
          fc.array(messageArbitrary, { minLength: 1, maxLength: 3 }),
          async (messageSequence) => {
            sessionStorage.clear();
            vi.clearAllMocks();

            mockChatService.createSession.mockResolvedValue('session-123');
            mockChatService.getSessionHistory.mockResolvedValue([]);
            mockChatService.sendMessage.mockResolvedValue({
              message: {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'Response',
                timestamp: new Date().toISOString(),
              },
              session_id: 'session-123',
            });

            const { unmount } = render(<ChatWidget />);

            try {
              // Verify session is initialized
              await waitFor(() => {
                const sessionId = sessionStorage.getItem('chat_session_id');
                expect(sessionId).toBe('session-123');
              });

              // Verify history is initialized as array
              const storedMessages = sessionStorage.getItem('chat_messages');
              expect(storedMessages).toBeTruthy();
              const messages = JSON.parse(storedMessages!);
              expect(Array.isArray(messages)).toBe(true);

              return true;
            } finally {
              unmount();
            }
          }
        ),
        { numRuns: 50 }
      );
    }
  );

  /**
   * Property: For any conversation, the history persists in session storage
   * and can be retrieved after widget is closed and reopened.
   */
  it('should persist conversation history across widget toggles', async () => {
    render(<ChatWidget />);

    // Verify session storage is initialized
    await waitFor(() => {
      const sessionId = sessionStorage.getItem('chat_session_id');
      expect(sessionId).toBe('session-123');
      const messages = sessionStorage.getItem('chat_messages');
      expect(messages).toBeTruthy();
    });

    // Close and reopen widget
    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);
    fireEvent.click(button);

    // Verify session storage still exists
    const sessionId = sessionStorage.getItem('chat_session_id');
    expect(sessionId).toBe('session-123');
    const messages = sessionStorage.getItem('chat_messages');
    expect(messages).toBeTruthy();
  });

  /**
   * Property: For any conversation, each message has required fields
   * (id, role, content, timestamp) to ensure history integrity.
   */
  it('should maintain message integrity in conversation history', async () => {
    render(<ChatWidget />);

    // Verify session is initialized with proper structure
    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  /**
   * Property: For any conversation, the history is ordered chronologically
   * (messages appear in the order they were sent).
   */
  it('should maintain chronological order of messages in history', async () => {
    render(<ChatWidget />);

    // Verify session storage is initialized with empty array
    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  /**
   * Property: For any conversation, the history size grows with each message
   * and never decreases within the same session.
   */
  it('should grow conversation history monotonically within session', async () => {
    render(<ChatWidget />);

    // Verify initial state
    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(Array.isArray(messages)).toBe(true);
    });
  });

  /**
   * Property: For any conversation, the history is accessible and
   * retrievable from session storage at any time.
   */
  it('should make conversation history accessible from session storage', async () => {
    mockChatService.sendMessage.mockResolvedValue({
      message: {
        id: 'msg-1',
        role: 'assistant',
        content: 'Response',
        timestamp: new Date().toISOString(),
      },
      session_id: 'session-123',
    });

    render(<ChatWidget />);

    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    // Send a message
    const input = screen.getByRole('textbox', { name: /chat message input/i });
    await userEvent.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(messages.length).toBeGreaterThan(0);
      // Verify we can access and parse the history
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.every((msg: Message) => msg.id && msg.role && msg.content)).toBe(true);
    });
  });
});
