import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from './ChatInput';

describe('ChatInput Component', () => {
  it('renders input field and send button', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByLabelText('Chat message input')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  it('sends message when send button is clicked', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message');

    await userEvent.type(input, 'Hello, AI!');
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Hello, AI!');
    expect(input.value).toBe('');
  });

  it('sends message when Enter key is pressed', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;

    await userEvent.type(input, 'Hello, AI!');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSend).toHaveBeenCalledWith('Hello, AI!');
    expect(input.value).toBe('');
  });

  it('allows newline with Shift+Enter', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;

    await userEvent.type(input, 'Line 1');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    // Message should not be sent
    expect(mockOnSend).not.toHaveBeenCalled();
    // Input should still contain text (newline added)
    expect(input.value).toContain('Line 1');
  });

  it('disables input when disabled prop is true', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message') as HTMLButtonElement;

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('disables send button when input is empty', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const sendButton = screen.getByLabelText('Send message') as HTMLButtonElement;

    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has text', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input');
    const sendButton = screen.getByLabelText('Send message') as HTMLButtonElement;

    await userEvent.type(input, 'Hello');

    expect(sendButton).not.toBeDisabled();
  });

  it('trims whitespace before sending', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message');

    await userEvent.type(input, '   Hello, AI!   ');
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Hello, AI!');
  });

  it('does not send empty or whitespace-only messages', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message');

    await userEvent.type(input, '   ');
    fireEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('clears input after sending', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message');

    await userEvent.type(input, 'Test message');
    fireEvent.click(sendButton);

    expect(input.value).toBe('');
  });

  it('does not send when disabled', async () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const input = screen.getByLabelText('Chat message input') as HTMLTextAreaElement;
    const sendButton = screen.getByLabelText('Send message');

    // Try to type (should be disabled)
    await userEvent.type(input, 'Hello');
    fireEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByLabelText('Chat message input');
    const sendButton = screen.getByLabelText('Send message');

    expect(input).toHaveAttribute('aria-label', 'Chat message input');
    expect(sendButton).toHaveAttribute('aria-label', 'Send message');
  });

  it('shows placeholder text', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/Type a message/i);
    expect(input).toBeInTheDocument();
  });
});
