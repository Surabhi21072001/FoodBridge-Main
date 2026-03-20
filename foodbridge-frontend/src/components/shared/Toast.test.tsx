import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

describe('Toast Component', () => {
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast with message', () => {
    render(
      <Toast
        id="test-1"
        message="Test message"
        variant="info"
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success variant with correct styling', () => {
    const { container } = render(
      <Toast
        id="test-1"
        message="Success message"
        variant="success"
        onDismiss={mockOnDismiss}
      />
    );

    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-success-50', 'border-success-200', 'text-success-800');
  });

  it('renders error variant with correct styling', () => {
    const { container } = render(
      <Toast
        id="test-1"
        message="Error message"
        variant="error"
        onDismiss={mockOnDismiss}
      />
    );

    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-danger-50', 'border-danger-200', 'text-danger-800');
  });

  it('renders warning variant with correct styling', () => {
    const { container } = render(
      <Toast
        id="test-1"
        message="Warning message"
        variant="warning"
        onDismiss={mockOnDismiss}
      />
    );

    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-warning-50', 'border-warning-200', 'text-warning-800');
  });

  it('renders info variant with correct styling', () => {
    const { container } = render(
      <Toast
        id="test-1"
        message="Info message"
        variant="info"
        onDismiss={mockOnDismiss}
      />
    );

    const toastElement = container.querySelector('[role="alert"]');
    expect(toastElement).toHaveClass('bg-info-50', 'border-info-200', 'text-info-800');
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <Toast
        id="test-1"
        message="Test message"
        variant="info"
        onDismiss={mockOnDismiss}
      />
    );

    const dismissButton = screen.getByLabelText('Dismiss notification');
    await user.click(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledWith('test-1');
  });

  it('auto-dismisses after specified duration', () => {
    vi.useFakeTimers();
    render(
      <Toast
        id="test-1"
        message="Test message"
        variant="success"
        duration={3000}
        onDismiss={mockOnDismiss}
      />
    );

    vi.advanceTimersByTime(3000);

    expect(mockOnDismiss).toHaveBeenCalledWith('test-1');
    vi.useRealTimers();
  });

  it('does not auto-dismiss when duration is not specified', () => {
    vi.useFakeTimers();
    render(
      <Toast
        id="test-1"
        message="Test message"
        variant="error"
        onDismiss={mockOnDismiss}
      />
    );

    vi.advanceTimersByTime(5000);

    expect(mockOnDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers();
    render(
      <Toast
        id="test-1"
        message="Test message"
        variant="info"
        duration={0}
        onDismiss={mockOnDismiss}
      />
    );

    vi.advanceTimersByTime(5000);

    expect(mockOnDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('clears timeout on unmount', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = render(
      <Toast
        id="test-1"
        message="Test message"
        variant="success"
        duration={3000}
        onDismiss={mockOnDismiss}
      />
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
    vi.useRealTimers();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Toast
        id="test-1"
        message="Test message"
        variant="info"
        onDismiss={mockOnDismiss}
      />
    );

    const toastElement = screen.getByRole('alert');
    expect(toastElement).toHaveAttribute('aria-live', 'polite');
  });

  it('renders correct icon for each variant', () => {
    const { container: successContainer } = render(
      <Toast
        id="test-1"
        message="Success"
        variant="success"
        onDismiss={mockOnDismiss}
      />
    );

    const successIcon = successContainer.querySelector('svg');
    expect(successIcon).toBeInTheDocument();

    const { container: errorContainer } = render(
      <Toast
        id="test-2"
        message="Error"
        variant="error"
        onDismiss={mockOnDismiss}
      />
    );

    const errorIcon = errorContainer.querySelector('svg');
    expect(errorIcon).toBeInTheDocument();
  });
});
