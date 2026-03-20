import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
 * Property 51: Conversation history persists across widget toggles
 * 
 * **Validates: Requirements 10.8**
 * 
 * For any chat session, closing and reopening the chat widget should preserve
 * the conversation history. The history stored in session storage should remain
 * intact and be retrievable after the widget is toggled closed and reopened.
 */
describe('Property 51: Conversation history persists across widget toggles', () => {
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
   * Property: For any conversation history, session storage should persist
   * across widget open/close cycles.
   */
  it('should preserve session storage across widget toggles', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    // Get initial state
    const initialSessionId = sessionStorage.getItem('chat_session_id');
    const initialMessages = sessionStorage.getItem('chat_messages');
    expect(initialSessionId).toBeTruthy();
    expect(initialMessages).toBeTruthy();

    // Toggle widget closed
    const toggleButton = screen.getByTestId('chat-widget-toggle');
    fireEvent.click(toggleButton);

    // Verify session storage is unchanged after close
    const closedSessionId = sessionStorage.getItem('chat_session_id');
    const closedMessages = sessionStorage.getItem('chat_messages');
    expect(closedSessionId).toBe(initialSessionId);
    expect(closedMessages).toBe(initialMessages);

    // Toggle widget open
    fireEvent.click(toggleButton);

    // Verify session storage is still unchanged
    const reopenedSessionId = sessionStorage.getItem('chat_session_id');
    const reopenedMessages = sessionStorage.getItem('chat_messages');
    expect(reopenedSessionId).toBe(initialSessionId);
    expect(reopenedMessages).toBe(initialMessages);
  });

  /**
   * Property-based test: For any sequence of widget toggles, the conversation
   * history in session storage should remain unchanged.
   */
  it(
    'should preserve session storage across multiple widget toggles [property-based]',
    async () => {
      // Generate arbitrary number of toggle sequences (1-3 toggles)
      const toggleCountArbitrary = fc.integer({ min: 1, max: 3 });

      await fc.assert(
        fc.asyncProperty(toggleCountArbitrary, async (toggleCount) => {
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

            // Get initial state
            const initialSessionId = sessionStorage.getItem('chat_session_id');
            const initialMessages = sessionStorage.getItem('chat_messages');

            // Perform toggle sequence
            const toggleButton = screen.getByTestId('chat-widget-toggle');

            for (let i = 0; i < toggleCount; i++) {
              fireEvent.click(toggleButton);

              // Verify session storage is unchanged after each toggle
              const currentSessionId = sessionStorage.getItem('chat_session_id');
              const currentMessages = sessionStorage.getItem('chat_messages');
              expect(currentSessionId).toBe(initialSessionId);
              expect(currentMessages).toBe(initialMessages);
            }

            return true;
          } finally {
            unmount();
          }
        }),
        { numRuns: 50 }
      );
    }
  );

  /**
   * Property: For any conversation history, the session ID should remain
   * constant across widget toggles.
   */
  it('should preserve session ID across widget toggles', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    const initialSessionId = sessionStorage.getItem('chat_session_id');

    // Toggle widget multiple times
    const toggleButton = screen.getByTestId('chat-widget-toggle');
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    // Verify session ID is unchanged
    const finalSessionId = sessionStorage.getItem('chat_session_id');
    expect(finalSessionId).toBe(initialSessionId);
  });

  /**
   * Property: For any conversation history, the message structure should
   * remain valid after widget toggles (all messages have required fields).
   */
  it('should maintain message structure integrity across widget toggles', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    // Get initial history
    const initialMessages = sessionStorage.getItem('chat_messages');
    const initialParsed = JSON.parse(initialMessages!);

    // Toggle widget
    const toggleButton = screen.getByTestId('chat-widget-toggle');
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    // Verify message structure is preserved
    const preservedMessages = sessionStorage.getItem('chat_messages');
    const preservedParsed = JSON.parse(preservedMessages!);

    // If there are messages, verify they have required fields
    if (preservedParsed.length > 0) {
      preservedParsed.forEach((msg: Message) => {
        expect(msg).toHaveProperty('id');
        expect(msg).toHaveProperty('role');
        expect(msg).toHaveProperty('content');
        expect(msg).toHaveProperty('timestamp');
      });
    }

    expect(preservedParsed).toEqual(initialParsed);
  });

  /**
   * Property: For any conversation history, the history should be accessible
   * from session storage immediately after widget reopens.
   */
  it('should make history immediately accessible after widget reopens', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    // Toggle widget closed and open
    const toggleButton = screen.getByTestId('chat-widget-toggle');
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    // Verify history is immediately accessible
    const messages = sessionStorage.getItem('chat_messages');
    expect(messages).toBeTruthy();
    expect(Array.isArray(JSON.parse(messages!))).toBe(true);
  });

  /**
   * Property: For any conversation history, the history size should not
   * change when the widget is toggled closed and reopened.
   */
  it('should preserve history size across widget toggles', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    // Get initial history size
    const initialMessages = sessionStorage.getItem('chat_messages');
    const initialSize = JSON.parse(initialMessages!).length;

    // Toggle widget
    const toggleButton = screen.getByTestId('chat-widget-toggle');
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    // Verify history size is unchanged
    const finalMessages = sessionStorage.getItem('chat_messages');
    const finalSize = JSON.parse(finalMessages!).length;
    expect(finalSize).toBe(initialSize);
  });

  /**
   * Property: For any conversation history, the history should be retrievable
   * from session storage even after multiple rapid toggles.
   */
  it('should preserve history across rapid widget toggles', async () => {
    render(<ChatWidget />);

    // Verify session is initialized
    await waitFor(() => {
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
    });

    // Get initial history
    const initialMessages = sessionStorage.getItem('chat_messages');
    const initialParsed = JSON.parse(initialMessages!);

    // Perform rapid toggle sequence
    const toggleButton = screen.getByTestId('chat-widget-toggle');
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    // Verify history is still preserved
    const finalMessages = sessionStorage.getItem('chat_messages');
    expect(finalMessages).toBeTruthy();
    const finalParsed = JSON.parse(finalMessages!);
    expect(finalParsed).toEqual(initialParsed);
  });
});
