import { describe, it, expect, vi, beforeEach } from 'vitest';
import chatService from './chatService';
import api from './api';
import type { Message, ChatResponse } from '../types/chat';

// Mock the API
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send a message and return chat response', async () => {
      const mockMessage: Message = {
        id: 'msg-1',
        role: 'assistant',
        content: 'I found some food listings for you',
        timestamp: '2024-01-15T10:00:00Z',
      };

      const mockChatResponse: ChatResponse = {
        message: mockMessage,
        session_id: 'session-123',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockChatResponse,
        message: 'Success',
      });

      const result = await chatService.sendMessage('session-123', 'Find me some food');

      expect(api.post).toHaveBeenCalledWith('/agent/chat', {
        session_id: 'session-123',
        message: 'Find me some food',
      });
      expect(result).toEqual(mockChatResponse);
    });

    it('should handle messages with tool calls', async () => {
      const mockMessage: Message = {
        id: 'msg-2',
        role: 'assistant',
        content: 'Searching for listings...',
        timestamp: '2024-01-15T10:05:00Z',
        tool_calls: [
          {
            tool_name: 'search_listings',
            status: 'success',
            result: { listings: [] },
          },
        ],
      };

      const mockChatResponse: ChatResponse = {
        message: mockMessage,
        session_id: 'session-123',
      };

      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: mockChatResponse,
        message: 'Success',
      });

      const result = await chatService.sendMessage('session-123', 'Find vegan food');

      expect(result.message.tool_calls).toBeDefined();
      expect(result.message.tool_calls?.[0].tool_name).toBe('search_listings');
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

      await expect(
        chatService.sendMessage('session-123', 'Find me some food')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getSessionHistory', () => {
    it('should fetch conversation history for a session', async () => {
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Find me some food',
          timestamp: '2024-01-15T10:00:00Z',
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'I found some listings',
          timestamp: '2024-01-15T10:01:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: {
          messages: mockMessages,
        },
        message: 'Success',
      });

      const result = await chatService.getSessionHistory('session-123');

      expect(api.get).toHaveBeenCalledWith('/agent/chat/sessions/session-123/history');
      expect(result).toEqual(mockMessages);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no history exists', async () => {
      vi.mocked(api.get).mockResolvedValue({
        success: true,
        data: {
          messages: [],
        },
        message: 'Success',
      });

      const result = await chatService.getSessionHistory('session-new');

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Session not found'));

      await expect(chatService.getSessionHistory('session-invalid')).rejects.toThrow(
        'Session not found'
      );
    });
  });

  describe('createSession', () => {
    it('should create a new chat session', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          session_id: 'session-456',
        },
        message: 'Success',
      });

      const result = await chatService.createSession();

      expect(api.post).toHaveBeenCalledWith('/agent/chat/sessions', {});
      expect(result).toBe('session-456');
    });

    it('should return a valid session ID', async () => {
      vi.mocked(api.post).mockResolvedValue({
        success: true,
        data: {
          session_id: 'session-789',
        },
        message: 'Success',
      });

      const result = await chatService.createSession();

      expect(result).toMatch(/^session-/);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Server error'));

      await expect(chatService.createSession()).rejects.toThrow('Server error');
    });
  });
});
