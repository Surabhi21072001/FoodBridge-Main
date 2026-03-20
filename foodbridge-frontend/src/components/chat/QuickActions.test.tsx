import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import QuickActions from './QuickActions';

describe('QuickActions Component', () => {
  it('renders all quick action buttons', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} />);

    expect(screen.getByTestId('quick-action-find-discounted')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-book-pantry')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-dining-deals')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-food-events')).toBeInTheDocument();
  });

  it('calls onActionClick with correct message when button is clicked', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} />);

    const findDiscountedButton = screen.getByTestId('quick-action-find-discounted');
    fireEvent.click(findDiscountedButton);

    expect(mockOnActionClick).toHaveBeenCalledWith('Show me discounted food listings available today');
  });

  it('calls onActionClick with correct message for book pantry action', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} />);

    const bookPantryButton = screen.getByTestId('quick-action-book-pantry');
    fireEvent.click(bookPantryButton);

    expect(mockOnActionClick).toHaveBeenCalledWith('Help me book a pantry appointment');
  });

  it('calls onActionClick with correct message for dining deals action', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} />);

    const diningDealsButton = screen.getByTestId('quick-action-dining-deals');
    fireEvent.click(diningDealsButton);

    expect(mockOnActionClick).toHaveBeenCalledWith('What dining deals are available?');
  });

  it('calls onActionClick with correct message for food events action', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} />);

    const foodEventsButton = screen.getByTestId('quick-action-food-events');
    fireEvent.click(foodEventsButton);

    expect(mockOnActionClick).toHaveBeenCalledWith('Tell me about upcoming food events');
  });

  it('disables buttons when disabled prop is true', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} disabled={true} />);

    const findDiscountedButton = screen.getByTestId('quick-action-find-discounted');
    expect(findDiscountedButton).toBeDisabled();

    const bookPantryButton = screen.getByTestId('quick-action-book-pantry');
    expect(bookPantryButton).toBeDisabled();

    const diningDealsButton = screen.getByTestId('quick-action-dining-deals');
    expect(diningDealsButton).toBeDisabled();

    const foodEventsButton = screen.getByTestId('quick-action-food-events');
    expect(foodEventsButton).toBeDisabled();
  });

  it('enables buttons when disabled prop is false', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} disabled={false} />);

    const findDiscountedButton = screen.getByTestId('quick-action-find-discounted');
    expect(findDiscountedButton).not.toBeDisabled();

    const bookPantryButton = screen.getByTestId('quick-action-book-pantry');
    expect(bookPantryButton).not.toBeDisabled();

    const diningDealsButton = screen.getByTestId('quick-action-dining-deals');
    expect(diningDealsButton).not.toBeDisabled();

    const foodEventsButton = screen.getByTestId('quick-action-food-events');
    expect(foodEventsButton).not.toBeDisabled();
  });

  it('renders buttons with secondary variant', () => {
    const mockOnActionClick = vi.fn();
    render(<QuickActions onActionClick={mockOnActionClick} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      // Check that buttons have secondary styling (bg-secondary-600)
      expect(button.className).toContain('bg-secondary-600');
    });
  });
});
