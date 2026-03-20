import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ChatWidget from './ChatWidget';
import chatService from '../../services/chatService';

// Mock dependencies
vi.mock('../../services/chatService');
vi.mock('../../hooks', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

describe('ChatWidget', () => {
  const mockChatService = chatService as any;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    // Mock chatService methods
    mockChatService.createSession.mockResolvedValue('session-123');
    mockChatService.sendMessage.mockImplementation(async (sessionId: string, message: string) => {
      // Return a proper response with the message
      return {
        message: {
          id: 'msg-1',
          role: 'assistant',
          content: 'Hello! How can I help you?',
          timestamp: new Date().toISOString(),
        },
        session_id: sessionId,
      };
    });
    mockChatService.getSessionHistory.mockResolvedValue([]);
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should render chat widget button', () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /open chat widget/i });
    expect(button).toBeInTheDocument();
  });

  it('should toggle chat panel when button is clicked', async () => {
    render(<ChatWidget />);
    const button = screen.getByRole('button', { name: /open chat widget/i });

    // Initially closed
    expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    // Click to close - find the close button in the header
    const panel = screen.getByTestId('chat-widget-panel');
    const closeButton = within(panel).getByRole('button', { name: /close chat widget/i });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();
    });
  });

  it('should initialize session on mount', async () => {
    render(<ChatWidget />);

    await waitFor(() => {
      expect(mockChatService.createSession).toHaveBeenCalled();
    });

    // Session ID should be stored in session storage
    expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
  });

  it('should display empty state when no messages', async () => {
    render(<ChatWidget />);

    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/start a conversation with the foodbridge assistant/i)
      ).toBeInTheDocument();
    });
  });

  it('should send message and display response', async () => {
    render(<ChatWidget />);

    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    // Verify sendMessage is called when user sends a message
    const input = screen.getByRole('textbox', { name: /chat message input/i });
    await userEvent.type(input, 'Find me some food');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockChatService.sendMessage).toHaveBeenCalledWith(
        'session-123',
        'Find me some food'
      );
    });
  });

  it('should persist messages to session storage', async () => {
    render(<ChatWidget />);

    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', { name: /chat message input/i });
    await userEvent.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].content).toBe('Test message');
    });
  });

  it('should clear input after sending message', async () => {
    render(<ChatWidget />);

    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox', {
      name: /chat message input/i,
    }) as HTMLTextAreaElement;
    await userEvent.type(input, 'Test message');

    expect(input.value).toBe('Test message');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should preserve conversation history when closing and reopening widget', async () => {
    render(<ChatWidget />);

    const button = screen.getByRole('button', { name: /open chat widget/i });

    // Open widget
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    // Verify session storage persists messages
    const input = screen.getByRole('textbox', { name: /chat message input/i });
    await userEvent.type(input, 'Hello');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    fireEvent.click(sendButton);

    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  it('should fetch backend history when session exists', async () => {
    const backendMessages = [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Previous message',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant' as const,
        content: 'Previous response',
        timestamp: new Date().toISOString(),
      },
    ];

    mockChatService.getSessionHistory.mockResolvedValue(backendMessages);

    // Set up existing session in storage
    sessionStorage.setItem('chat_session_id', 'session-123');
    sessionStorage.setItem('chat_messages', JSON.stringify([]));

    render(<ChatWidget />);

    await waitFor(() => {
      expect(mockChatService.getSessionHistory).toHaveBeenCalledWith('session-123');
    });

    // Open widget to see messages
    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Previous message')).toBeInTheDocument();
      expect(screen.getByText('Previous response')).toBeInTheDocument();
    });
  });

  it('should merge backend history with session storage cache', async () => {
    const backendMessages = [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Backend message',
        timestamp: new Date().toISOString(),
      },
    ];

    mockChatService.getSessionHistory.mockResolvedValue(backendMessages);

    // Set up existing session with cached messages
    sessionStorage.setItem('chat_session_id', 'session-123');
    sessionStorage.setItem(
      'chat_messages',
      JSON.stringify([
        {
          id: 'msg-0',
          role: 'user',
          content: 'Cached message',
          timestamp: new Date().toISOString(),
        },
      ])
    );

    render(<ChatWidget />);

    await waitFor(() => {
      expect(mockChatService.getSessionHistory).toHaveBeenCalledWith('session-123');
    });

    // Backend history should take precedence
    const storedMessages = sessionStorage.getItem('chat_messages');
    const messages = JSON.parse(storedMessages!);
    expect(messages[0].content).toBe('Backend message');
  });

  it('should fall back to session storage when backend history fetch fails', async () => {
    const cachedMessages = [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Cached message',
        timestamp: new Date().toISOString(),
      },
    ];

    mockChatService.getSessionHistory.mockRejectedValue(new Error('Network error'));

    // Set up existing session with cached messages
    sessionStorage.setItem('chat_session_id', 'session-123');
    sessionStorage.setItem('chat_messages', JSON.stringify(cachedMessages));

    render(<ChatWidget />);

    await waitFor(() => {
      expect(mockChatService.getSessionHistory).toHaveBeenCalledWith('session-123');
    });

    // Verify that cached messages are loaded from session storage
    await waitFor(() => {
      const storedMessages = sessionStorage.getItem('chat_messages');
      expect(storedMessages).toBeTruthy();
      const messages = JSON.parse(storedMessages!);
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Cached message');
    });
  });

  it('should maintain session continuity across page reloads', async () => {
    const backendMessages = [
      {
        id: 'msg-1',
        role: 'user' as const,
        content: 'Message from previous session',
        timestamp: new Date().toISOString(),
      },
    ];

    mockChatService.getSessionHistory.mockResolvedValue(backendMessages);

    // Simulate existing session from previous page load
    sessionStorage.setItem('chat_session_id', 'session-123');
    sessionStorage.setItem('chat_messages', JSON.stringify([]));

    const { unmount } = render(<ChatWidget />);

    await waitFor(() => {
      expect(mockChatService.getSessionHistory).toHaveBeenCalledWith('session-123');
    });

    // Verify session ID persists
    expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');

    // Unmount and remount to simulate page reload
    unmount();
    vi.clearAllMocks();
    mockChatService.getSessionHistory.mockResolvedValue(backendMessages);

    render(<ChatWidget />);

    await waitFor(() => {
      // Should use same session ID
      expect(sessionStorage.getItem('chat_session_id')).toBe('session-123');
      // Should fetch history again
      expect(mockChatService.getSessionHistory).toHaveBeenCalledWith('session-123');
    });

    // Open widget to verify messages are restored
    const button = screen.getByRole('button', { name: /open chat widget/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Message from previous session')).toBeInTheDocument();
    });
  });
});