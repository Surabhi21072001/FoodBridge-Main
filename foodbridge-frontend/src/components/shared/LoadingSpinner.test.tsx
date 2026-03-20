import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default size (md)', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('renders with sm size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('renders with lg size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    const svg = spinner.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('has aria-live="polite" for accessibility', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('has default aria-label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('accepts custom aria-label', () => {
    render(<LoadingSpinner ariaLabel="Processing request" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing request');
  });

  it('has aria-hidden on svg', () => {
    render(<LoadingSpinner />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies animate-spin class to svg', () => {
    render(<LoadingSpinner />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('applies primary color class', () => {
    render(<LoadingSpinner />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toHaveClass('text-primary-600');
  });
});
