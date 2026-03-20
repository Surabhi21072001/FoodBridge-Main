import api from './api';
import type { Message, ChatResponse } from '../types/chat';

/**
 * Chat Service
 * Handles chat operations including sending messages, retrieving session history, and creating sessions
 */
class ChatService {
  /**
   * Send a message to the chat endpoint
   * Sends a user message to the AI assistant and receives a response
   * @param sessionId - The chat session ID
   * @param message - The user's message content
   * @returns Promise containing the chat response with the assistant's message
   */
  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    try {
      const response = await api.post<any>('/chat', {
        sessionId,
        message,
      });
      // Backend returns { success, data: { sessionId, response, toolsUsed } }
      // api.post already unwraps to response.data, so we access .data directly
      return response?.data || {};
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get conversation history for a session
   * Fetches all messages from a previous chat session
   * @param sessionId - The chat session ID
   * @returns Promise containing array of messages in the session
   */
  async getSessionHistory(sessionId: string): Promise<Message[]> {
    try {
      const response = await api.get<any>(
        `/chat/${sessionId}/history`
      );
      return response?.data?.messages || [];
    } catch (error) {
      // History endpoint may not exist yet, return empty array
      console.debug('Session history not available:', error);
      return [];
    }
  }

  /**
   * Create a new chat session
   * Generates a new session ID on the client side
   * @returns Promise containing the new session ID
   */
  async createSession(): Promise<string> {
    try {
      // Generate a UUID for the session on the client side
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return sessionId;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
