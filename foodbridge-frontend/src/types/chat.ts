/**
 * Chat-related type definitions
 */

export interface ToolCall {
  id: string;
  name: string;
  arguments?: Record<string, any>;
  tool_name?: string;
  status?: 'executing' | 'success' | 'error';
  result?: any;
  error?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tool_calls?: ToolCall[];
}

export interface ChatResponse {
  sessionId?: string;
  response?: string;
  toolsUsed?: string[];
  success?: boolean;
  error?: string;
  message?: Message;
  session_id?: string;
}
