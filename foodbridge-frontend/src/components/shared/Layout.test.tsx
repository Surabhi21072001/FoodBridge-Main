import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';
import * as notificationsHook from '../../hooks/useNotifications';

// Mock the useNotifications hook
vi.mock('../../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}));

// Mock ChatWidget to avoid complex dependencies
vi.mock('../chat/ChatWidget', () => ({
  default: () => <div data-testid="chat-widget">Chat Widget</div>,
}));

describe('Layout Component', () => {
  const mockGetUnreadCount = vi.fn().mockResolvedValue(5);

  beforeEach(() => {
    vi.clearAllMocks();
    (notificationsHook.useNotifications as any).mockReturnValue({
      getUnreadCount: mockGetUnreadCount,
    });
  });

  const renderLayout = (children: React.ReactNode = <div>Test Content</div>) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Layout>{children}</Layout>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render the layout with navigation', () => {
    renderLayout();
    expect(screen.getByText('FoodBridge')).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderLayout(<div>Test Content</div>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render the chat widget', () => {
    renderLayout();
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('should render the footer', () => {
    renderLayout();
    expect(screen.getByText(/FoodBridge. All rights reserved/)).toBeInTheDocument();
  });

  it('should fetch unread notification count on mount', async () => {
    renderLayout();
    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
  });

  it('should have responsive container with proper spacing', () => {
    const { container } = renderLayout();
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex-1', 'w-full');
  });

  it('should have proper flex layout structure', () => {
    const { container } = renderLayout();
    const layoutDiv = container.firstChild;
    expect(layoutDiv).toHaveClass('flex', 'flex-col', 'min-h-screen');
  });

  it('should render navigation with unread count', async () => {
    renderLayout();
    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
    });
    // Navigation component should receive the unread count
    const notificationLinks = screen.getAllByLabelText('Notifications');
    expect(notificationLinks.length).toBeGreaterThan(0);
  });

  it('should set up polling interval for notifications', async () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    renderLayout();
    await waitFor(() => {
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
    });
    setIntervalSpy.mockRestore();
  });

  it('should clean up polling interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderLayout();
    await waitFor(() => {
      expect(vi.fn()).toBeDefined();
    });
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should have proper max-width container for content', () => {
    const { container } = renderLayout();
    const contentDiv = container.querySelector('main > div');
    expect(contentDiv).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('should have responsive padding on content container', () => {
    const { container } = renderLayout();
    const contentDiv = container.querySelector('main > div');
    expect(contentDiv).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });
});
