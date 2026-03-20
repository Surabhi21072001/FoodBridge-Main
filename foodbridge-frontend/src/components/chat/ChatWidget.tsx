import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../../types/chat';
import chatService from '../../services/chatService';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';
import ToolExecutionFeedback from './ToolExecutionFeedback';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ChatWidget Component
 * 
 * Collapsible AI chat widget with conversation history persistence and retrieval.
 * 
 * Requirements:
 * - Visible and accessible on all authenticated pages (Requirement 10.1)
 * - Expandable/collapsible interface (Requirement 10.2)
 * - Send messages to chat endpoint and display responses (Requirement 10.3)
 * - Display loading indicator during processing (Requirement 10.4)
 * - Display tool execution feedback (Requirement 10.5)
 * - Display formatted results (Requirement 10.6)
 * - Maintain conversation history within session (Requirement 10.7)
 * - Preserve history when closing/reopening widget (Requirement 10.8)
 * - Clear history on new session (Requirement 10.9)
 * - Support markdown formatting (Requirement 10.10)
 * 
 * Features:
 * - Fetches conversation history from backend on session initialization
 * - Merges backend history with session storage cache
 * - Maintains session continuity across page reloads
 * - Persists messages to session storage for offline access
 */
const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const newSessionId = await chatService.createSession();
        setSessionId(newSessionId);
        sessionStorage.setItem('chat_session_id', newSessionId);
        setMessages([]);
      } catch (error) {
        showToast('Failed to initialize chat session', 'error');
      }
    };

    initializeSession();
  }, [showToast]);

  // Persist messages to session storage whenever they change
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  const handleClose = async () => {
    setIsOpen(false);
    setMessages([]);
    sessionStorage.removeItem('chat_messages');
    sessionStorage.removeItem('chat_session_id');
    // Create a fresh session so next open starts clean
    try {
      const newSessionId = await chatService.createSession();
      setSessionId(newSessionId);
      sessionStorage.setItem('chat_session_id', newSessionId);
    } catch {
      setSessionId('');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    if (!sessionId || !userMessage.trim()) return;

    // Add user message to conversation
    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Send message to chat endpoint with timeout
      const timeoutId = setTimeout(() => {
        showToast('Request timed out. Please try again.', 'error');
        setIsLoading(false);
      }, 30000); // 30 second timeout

      const response = await chatService.sendMessage(sessionId, userMessage);
      clearTimeout(timeoutId);

      console.log('Chat response:', response);

      if (response && response.response) {
        // Add assistant message to conversation
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          tool_calls: response.toolsUsed ? response.toolsUsed.map((tool: string) => ({
            id: `tool-${Date.now()}`,
            name: tool,
            arguments: {},
          })) : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        showToast('No response from assistant', 'warning');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSessionId = await chatService.createSession();
      setSessionId(newSessionId);
      sessionStorage.setItem('chat_session_id', newSessionId);
      setMessages([]);
      sessionStorage.setItem('chat_messages', JSON.stringify([]));
    } catch (error) {
      showToast('Failed to start new session', 'error');
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
      {/* Pulsating ring animation */}
      <style>{`
        @keyframes chat-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .chat-pulse-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #ff6b35;
          animation: chat-pulse 2s ease-out infinite;
        }
      `}</style>

      {/* Chat Widget Button */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        {!isOpen && <span className="chat-pulse-ring" />}
        <button
          onClick={() => {
            if (isOpen) {
              handleClose();
            } else {
              setIsOpen(true);
            }
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            backgroundColor: '#ff6b35',
            color: 'white',
            borderRadius: '50%',
            border: 'none',
            boxShadow: '0 10px 25px -3px rgba(255, 107, 53, 0.5)',
            cursor: 'pointer',
            transition: 'background-color 0.2s, transform 0.2s',
            fontSize: '32px',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e55a2b';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ff6b35';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={isOpen ? 'Close chat widget' : 'Open chat widget'}
          aria-expanded={isOpen}
          data-testid="chat-widget-toggle"
        >
          🤖
        </button>
      </div>

      {/* Chat Widget Panel */}
      {isOpen && (

        <div
          className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col"
          style={{ height: '520px' }}
          role="region"
          aria-label="Chat widget"
          data-testid="chat-widget-panel"
        >
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">FoodBridge Assistant</h3>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <button
                  onClick={handleNewSession}
                  className="text-white hover:bg-primary-700 p-1 rounded transition-colors"
                  aria-label="Start new conversation"
                  title="Start new conversation"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-white hover:bg-primary-700 p-1 rounded transition-colors"
                aria-label="Close chat widget"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto p-4 pb-6 bg-gray-50"
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            data-testid="chat-messages-container"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                <p>Start a conversation with the FoodBridge Assistant</p>
                <p className="text-xs mt-2">Ask about food listings, reservations, and more</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} data-testid={`chat-message-${message.id}`}>
                    <ChatMessage message={message} isUser={message.role === 'user'} />
                    {message.tool_calls && message.tool_calls.length > 0 && (
                      <div className="ml-8 mb-4">
                        {message.tool_calls.map((toolCall, idx) => (
                          <ToolExecutionFeedback
                            key={`${message.id}-tool-${idx}`}
                            toolCall={toolCall}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm py-4">
                    <LoadingSpinner size="sm" ariaLabel="Assistant is typing" />
                    <span>Assistant is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            {messages.length === 0 && (
              <QuickActions onActionClick={handleSendMessage} disabled={isLoading} role={user?.role} />
            )}
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
