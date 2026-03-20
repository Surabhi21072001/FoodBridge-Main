import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useToast from './useToast';

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty toasts array', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast with showToast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 'info');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].variant).toBe('info');
  });

  it('returns unique toast ID', () => {
    const { result } = renderHook(() => useToast());

    let id1: string;
    let id2: string;

    act(() => {
      id1 = result.current.showToast('Toast 1', 'info');
      id2 = result.current.showToast('Toast 2', 'info');
    });

    expect(id1).not.toBe(id2);
  });

  it('sets default duration for success variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Success', 'success');
    });

    expect(result.current.toasts[0].duration).toBe(3000);
  });

  it('does not set default duration for error variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Error', 'error');
    });

    expect(result.current.toasts[0].duration).toBeUndefined();
  });

  it('respects custom duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Custom', 'info', 5000);
    });

    expect(result.current.toasts[0].duration).toBe(5000);
  });

  it('dismisses a toast by ID', () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;

    act(() => {
      toastId = result.current.showToast('Test', 'info');
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('clears all toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Toast 1', 'info');
      result.current.showToast('Toast 2', 'error');
      result.current.showToast('Toast 3', 'success');
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Toast 1', 'success');
      result.current.showToast('Toast 2', 'error');
      result.current.showToast('Toast 3', 'warning');
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts[0].variant).toBe('success');
    expect(result.current.toasts[1].variant).toBe('error');
    expect(result.current.toasts[2].variant).toBe('warning');
  });

  it('only dismisses the specified toast', () => {
    const { result } = renderHook(() => useToast());

    let id1: string;
    let id2: string;

    act(() => {
      id1 = result.current.showToast('Toast 1', 'info');
      id2 = result.current.showToast('Toast 2', 'info');
    });

    act(() => {
      result.current.dismissToast(id1);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Toast 2');
  });

  it('handles dismissing non-existent toast gracefully', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Toast 1', 'info');
    });

    act(() => {
      result.current.dismissToast('non-existent-id');
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it('defaults to info variant when not specified', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.toasts[0].variant).toBe('info');
  });
});
