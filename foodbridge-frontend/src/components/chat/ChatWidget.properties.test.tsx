import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ChatWidget from './ChatWidget';

// Mock dependencies
vi.mock('../../services/chatService', () => ({
  default: {
    createSession: vi.fn().mockResolvedValue('session-123'),
    sendMessage: vi.fn().mockResolvedValue({
      message: {
        id: 'msg-1',
        role: 'assistant',
        content: 'Hello!',
        timestamp: new Date().toISOString(),
      },
      session_id: 'session-123',
    }),
    getSessionHistory: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../hooks', () => ({
  useToast: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

/**
 * Property 45: Chat widget is accessible on all authenticated pages
 * 
 * **Validates: Requirements 10.1**
 * 
 * For any authenticated page, the chat widget should be visible and accessible
 * (present in the DOM, has proper ARIA attributes, and can be interacted with).
 */
describe('Property 45: Chat widget is accessible on all authenticated pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * Property: For any authenticated page, the chat widget button is present
   * and has proper accessibility attributes.
   */
  it('should render chat widget button on authenticated pages', () => {
    render(<ChatWidget />);

    // Chat widget button should be present
    const chatButton = screen.getByRole('button', { name: /open chat widget/i });
    expect(chatButton).toBeInTheDocument();

    // Button should have proper accessibility attributes
    expect(chatButton).toHaveAttribute('aria-label');
    expect(chatButton).toHaveAttribute('aria-expanded');
  });

  /**
   * Property: For any authenticated page, the chat widget is accessible
   * via keyboard navigation (can be focused and interacted with).
   */
  it('should make chat widget keyboard accessible', () => {
    render(<ChatWidget />);

    const chatButton = screen.getByRole('button', { name: /open chat widget/i });

    // Button should be focusable
    expect(chatButton).not.toHaveAttribute('disabled');
    expect(chatButton).toHaveAttribute('aria-label');

    // Button should have proper focus styling (via Tailwind classes)
    expect(chatButton).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  /**
   * Property: For any authenticated page, the chat widget has proper ARIA
   * attributes for screen readers.
   */
  it('should have proper ARIA attributes for accessibility', async () => {
    render(<ChatWidget />);

    const chatButton = screen.getByRole('button', { name: /open chat widget/i });

    // aria-label should be present
    expect(chatButton).toHaveAttribute('aria-label');

    // aria-expanded should indicate state
    expect(chatButton).toHaveAttribute('aria-expanded', 'false');

    // When opened, aria-expanded should change
    chatButton.click();

    // After opening, the panel should have proper ARIA attributes
    await waitFor(() => {
      const chatPanel = screen.getByRole('region', { name: /chat widget/i });
      expect(chatPanel).toBeInTheDocument();
    });
  });

  /**
   * Property: For any authenticated page, the chat widget is positioned
   * consistently and doesn't interfere with page content.
   */
  it('should position chat widget consistently on all pages', () => {
    render(<ChatWidget />);

    const chatButton = screen.getByRole('button', { name: /open chat widget/i });

    // Chat widget should be fixed positioned (bottom-right)
    const chatContainer = chatButton.parentElement;
    expect(chatContainer).toHaveClass('fixed', 'bottom-4', 'right-4', 'z-50');
  });

  /**
   * Property-based test: For any authenticated page, the chat widget
   * is always present and accessible regardless of page content.
   */
  it(
    'should render chat widget on all authenticated pages [property-based]',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          async (pageTitle, pageContent) => {
            const { unmount } = render(
              <div>
                <h1>{pageTitle}</h1>
                <p>{pageContent}</p>
                <ChatWidget />
              </div>
            );

            try {
              // Chat widget button should always be present
              const chatButton = screen.getByRole('button', { name: /open chat widget/i });
              expect(chatButton).toBeInTheDocument();

              // Chat widget should have proper accessibility attributes
              expect(chatButton).toHaveAttribute('aria-label');
              expect(chatButton).toHaveAttribute('aria-expanded');

              // Chat widget should be in the fixed position container
              const chatContainer = chatButton.parentElement;
              expect(chatContainer).toHaveClass('fixed');

              return true;
            } finally {
              unmount();
            }
          }
        )
      );
    }
  );

  /**
   * Property: For any authenticated page, the chat widget can be toggled
   * open and closed, indicating it's interactive and accessible.
   */
  it('should allow toggling chat widget on authenticated pages', async () => {
    render(<ChatWidget />);

    const chatButton = screen.getByRole('button', { name: /open chat widget/i });

    // Initially closed
    expect(chatButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();

    // Click to open
    chatButton.click();
    await waitFor(() => {
      expect(chatButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('chat-widget-panel')).toBeInTheDocument();
    });

    // Click to close
    chatButton.click();
    await waitFor(() => {
      expect(chatButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByTestId('chat-widget-panel')).not.toBeInTheDocument();
    });
  });

  /**
   * Property: For any authenticated page, the chat widget panel has
   * proper ARIA attributes when open.
   */
  it('should have accessible chat panel when opened', async () => {
    render(<ChatWidget />);

    const chatButton = screen.getByRole('button', { name: /open chat widget/i });
    chatButton.click();

    // Chat panel should have proper ARIA attributes
    await waitFor(() => {
      const chatPanel = screen.getByRole('region', { name: /chat widget/i });
      expect(chatPanel).toBeInTheDocument();

      // Messages container should have aria-live for screen readers
      const messagesContainer = within(chatPanel).getByRole('log', {
        name: /chat messages/i,
      });
      expect(messagesContainer).toHaveAttribute('aria-live', 'polite');
      expect(messagesContainer).toHaveAttribute('aria-label');
    });
  });

  /**
   * Property: For any authenticated page, the chat widget close button
   * is accessible and properly labeled.
   */
  it('should have accessible close button in chat panel', async () => {
    render(<ChatWidget />);

    const chatButton = screen.getByRole('button', { name: /open chat widget/i });
    chatButton.click();

    await waitFor(() => {
      const chatPanel = screen.getByTestId('chat-widget-panel');
      const closeButton = within(chatPanel).getByRole('button', {
        name: /close chat widget/i,
      });

      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });
});
