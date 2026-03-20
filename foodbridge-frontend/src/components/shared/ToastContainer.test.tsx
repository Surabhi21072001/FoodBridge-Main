import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToastContainer, { ToastMessage } from './ToastContainer';

describe('ToastContainer Component', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty container when no toasts', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={mockOnDismiss} />
    );

    const region = container.querySelector('[role="region"]');
    expect(region).toBeInTheDocument();
    expect(region?.children.length).toBe(0);
  });

  it('renders multiple toasts', () => {
    const toasts: ToastMessage[] = [
      { id: '1', message: 'Toast 1', variant: 'success' },
      { id: '2', message: 'Toast 2', variant: 'error' },
      { id: '3', message: 'Toast 3', variant: 'info' },
    ];

    render(
      <ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />
    );

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
    expect(screen.getByText('Toast 3')).toBeInTheDocument();
  });

  it('calls onDismiss when toast is dismissed', async () => {
    const user = userEvent.setup({ delay: null });
    const toasts: ToastMessage[] = [
      { id: '1', message: 'Test toast', variant: 'info' },
    ];

    render(
      <ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />
    );

    const dismissButtons = screen.getAllByLabelText('Dismiss notification');
    await user.click(dismissButtons[0]);

    expect(mockOnDismiss).toHaveBeenCalledWith('1');
  });

  it('has proper accessibility attributes', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={mockOnDismiss} />
    );

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveAttribute('aria-label', 'Notifications');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'false');
  });

  it('renders toasts with correct variants', () => {
    const toasts: ToastMessage[] = [
      { id: '1', message: 'Success', variant: 'success' },
      { id: '2', message: 'Error', variant: 'error' },
      { id: '3', message: 'Warning', variant: 'warning' },
      { id: '4', message: 'Info', variant: 'info' },
    ];

    const { container } = render(
      <ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />
    );

    const alerts = container.querySelectorAll('[role="alert"]');
    expect(alerts.length).toBe(4);

    expect(alerts[0]).toHaveClass('bg-success-50');
    expect(alerts[1]).toHaveClass('bg-danger-50');
    expect(alerts[2]).toHaveClass('bg-warning-50');
    expect(alerts[3]).toHaveClass('bg-info-50');
  });

  it('passes duration to toast components', () => {
    const toasts: ToastMessage[] = [
      { id: '1', message: 'Toast 1', variant: 'success', duration: 3000 },
      { id: '2', message: 'Toast 2', variant: 'error', duration: undefined },
    ];

    render(
      <ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />
    );

    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });

  it('maintains correct spacing between toasts', () => {
    const toasts: ToastMessage[] = [
      { id: '1', message: 'Toast 1', variant: 'success' },
      { id: '2', message: 'Toast 2', variant: 'error' },
    ];

    const { container } = render(
      <ToastContainer toasts={toasts} onDismiss={mockOnDismiss} />
    );

    const region = container.querySelector('[role="region"]');
    expect(region).toHaveClass('gap-2');
  });
});
