import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ImageWithFallback from './ImageWithFallback';

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  
  observe = vi.fn((element: Element) => {
    // Trigger callback immediately with isIntersecting = true
    const entry = {
      isIntersecting: true,
      target: element,
    } as IntersectionObserverEntry;
    this.callback([entry], this as any);
  });
  
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe('ImageWithFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders placeholder while loading', () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholderClassName="placeholder"
      />
    );

    const placeholder = container.querySelector('.placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('displays image when loaded successfully', async () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    );

    await waitFor(() => {
      const img = container.querySelector('img[alt="Test image"]');
      expect(img).toBeInTheDocument();
    });
  });

  it('displays fallback image when primary image fails to load', async () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/bad-image.jpg"
        alt="Test image"
        fallbackSrc="https://example.com/fallback.jpg"
      />
    );

    await waitFor(() => {
      const primaryImg = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
      expect(primaryImg).toBeInTheDocument();
      primaryImg.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      const fallbackImg = container.querySelector('img[alt="Test image (fallback)"]');
      expect(fallbackImg).toBeInTheDocument();
    });
  });

  it('displays placeholder icon when both images fail', async () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/bad-image.jpg"
        alt="Test image"
        fallbackSrc="https://example.com/bad-fallback.jpg"
      />
    );

    await waitFor(() => {
      const primaryImg = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
      primaryImg.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      const fallbackImg = container.querySelector('img[alt="Test image (fallback)"]') as HTMLImageElement;
      fallbackImg.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('displays placeholder icon when no fallback provided and primary fails', async () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/bad-image.jpg"
        alt="Test image"
      />
    );

    await waitFor(() => {
      const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
      img.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('calls onLoad callback when image loads', async () => {
    const onLoad = vi.fn();
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={onLoad}
      />
    );

    await waitFor(() => {
      const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
      img.dispatchEvent(new Event('load'));
    });

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    });
  });

  it('calls onError callback when image fails', async () => {
    const onError = vi.fn();
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/bad-image.jpg"
        alt="Test image"
        onError={onError}
      />
    );

    await waitFor(() => {
      const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
      img.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies custom fallbackClassName', async () => {
    const { container } = render(
      <ImageWithFallback
        src="https://example.com/bad-image.jpg"
        alt="Test image"
        fallbackClassName="custom-fallback"
      />
    );

    await waitFor(() => {
      const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
      img.dispatchEvent(new Event('error'));
    });

    await waitFor(() => {
      const fallback = container.querySelector('.custom-fallback');
      expect(fallback).toBeInTheDocument();
    });
  });
});
