import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import LazyImage from './LazyImage';

describe('LazyImage Component', () => {
  let observeCallback: IntersectionObserverCallback | null = null;
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn((element: Element) => {
      // Simulate element entering viewport
      if (observeCallback) {
        observeCallback(
          [
            {
              isIntersecting: true,
              target: element,
            } as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver
        );
      }
    });

    disconnectMock = vi.fn();

    // Mock IntersectionObserver as a class
    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observeCallback = callback;
      }
      observe = observeMock;
      disconnect = disconnectMock;
      unobserve = vi.fn();
    }

    global.IntersectionObserver = MockIntersectionObserver as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    observeCallback = null;
  });

  it('should render placeholder while image is loading', () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="w-full h-48"
      />
    );

    const placeholder = container.querySelector('.animate-pulse');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('animate-pulse');
  });

  it('should load image when it enters viewport', async () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="w-full h-48"
      />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('alt', 'Test image');
  });

  it('should call onLoad callback when image loads', async () => {
    const onLoadMock = vi.fn();
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={onLoadMock}
      />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled();
    });
  });

  it('should apply opacity transition when image loads', async () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="w-full h-48"
      />
    );

    const img = container.querySelector('img') as HTMLImageElement;

    // Before load
    expect(img).toHaveClass('opacity-0');

    // Simulate load
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(img).toHaveClass('opacity-100');
    });
  });

  it('should handle image load errors', async () => {
    const onErrorMock = vi.fn();
    const { container } = render(
      <LazyImage
        src="https://example.com/invalid.jpg"
        alt="Test image"
        onError={onErrorMock}
      />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalled();
    });

    // Should display error message
    expect(screen.getByText('Failed to load image')).toBeInTheDocument();
  });

  it('should display error fallback when image fails to load', async () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/invalid.jpg"
        alt="Test image"
      />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('Failed to load image')).toBeInTheDocument();
    });
  });

  it('should accept custom placeholder className', () => {
    const { container } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholderClassName="w-full h-64 bg-blue-200"
      />
    );

    const placeholder = container.querySelector('.bg-blue-200');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveClass('bg-blue-200');
  });

  it('should accept custom className for container', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="w-full h-48 rounded-lg"
      />
    );

    const container = screen.getByRole('img', { hidden: true }).parentElement;
    expect(container).toHaveClass('w-full', 'h-48', 'rounded-lg');
  });

  it('should disconnect observer on unmount', () => {
    const { unmount } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    );

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it('should use 50px rootMargin for Intersection Observer', () => {
    const optionsMock = vi.fn();

    class MockIntersectionObserverWithOptions {
      constructor(
        callback: IntersectionObserverCallback,
        options: IntersectionObserverInit
      ) {
        observeCallback = callback;
        optionsMock(options);
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }

    global.IntersectionObserver = MockIntersectionObserverWithOptions as any;

    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    );

    expect(optionsMock).toHaveBeenCalledWith(
      expect.objectContaining({ rootMargin: '50px' })
    );
  });
});
