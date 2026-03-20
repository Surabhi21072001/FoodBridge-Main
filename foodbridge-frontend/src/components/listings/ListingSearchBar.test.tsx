import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ListingSearchBar from './ListingSearchBar';

describe('ListingSearchBar', () => {
  it('renders search input with placeholder', () => {
    const mockOnSearch = vi.fn();
    render(<ListingSearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/search by food name/i);
    expect(input).toBeInTheDocument();
  });

  it('calls onSearch with query after debounce', async () => {
    const mockOnSearch = vi.fn();
    render(<ListingSearchBar onSearch={mockOnSearch} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText(/search by food name/i) as HTMLInputElement;
    await userEvent.type(input, 'pizza');
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('pizza');
    }, { timeout: 200 });
  });

  it('displays clear button when search query exists', async () => {
    const mockOnSearch = vi.fn();
    render(<ListingSearchBar onSearch={mockOnSearch} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText(/search by food name/i);
    await userEvent.type(input, 'pizza');
    
    await waitFor(() => {
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });
  });

  it('clears search when clear button is clicked', async () => {
    const mockOnSearch = vi.fn();
    render(<ListingSearchBar onSearch={mockOnSearch} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText(/search by food name/i) as HTMLInputElement;
    await userEvent.type(input, 'pizza');
    
    await waitFor(() => {
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('debounces multiple rapid inputs', async () => {
    const mockOnSearch = vi.fn();
    render(<ListingSearchBar onSearch={mockOnSearch} debounceMs={100} />);
    
    const input = screen.getByPlaceholderText(/search by food name/i);
    
    // Type each character with minimal delay to simulate rapid typing
    fireEvent.change(input, { target: { value: 'p' } });
    fireEvent.change(input, { target: { value: 'pi' } });
    fireEvent.change(input, { target: { value: 'piz' } });
    
    // Wait for debounce to complete
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('piz');
    }, { timeout: 200 });
    
    // Should only be called once despite multiple changes
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });
});
