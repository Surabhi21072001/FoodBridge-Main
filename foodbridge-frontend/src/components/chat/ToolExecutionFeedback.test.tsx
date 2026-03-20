import React from 'react';
import { render, screen } from '@testing-library/react';
import ToolExecutionFeedback from './ToolExecutionFeedback';
import { ToolCall } from '../../types/chat';

describe('ToolExecutionFeedback Component', () => {
  describe('Executing Status', () => {
    it('should display loading indicator when status is executing', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Search Listings')).toBeInTheDocument();
      expect(screen.getByText('Executing')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should display processing message during execution', () => {
      const toolCall: ToolCall = {
        tool_name: 'book_appointment',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Processing Book Appointment...')).toBeInTheDocument();
    });

    it('should have executing status badge with correct styling', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'executing',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const badge = container.querySelector('.bg-blue-100');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-blue-700');
    });
  });

  describe('Success Status', () => {
    it('should display success badge when status is success', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: { count: 5 },
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Success')).toBeInTheDocument();
      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-green-700');
    });

    it('should display success icon', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: { count: 5 },
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const successIcon = container.querySelector('.bg-green-100 svg');
      expect(successIcon).toBeInTheDocument();
    });

    it('should display string result', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: 'Found 5 listings',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Found 5 listings')).toBeInTheDocument();
    });

    it('should display number result', () => {
      const toolCall: ToolCall = {
        tool_name: 'count_items',
        status: 'success',
        result: 42,
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display boolean result', () => {
      const toolCall: ToolCall = {
        tool_name: 'check_availability',
        status: 'success',
        result: true,
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('true')).toBeInTheDocument();
    });

    it('should display object result as key-value pairs', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_user_info',
        status: 'success',
        result: {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
        },
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('name:')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('email:')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('role:')).toBeInTheDocument();
      expect(screen.getByText('student')).toBeInTheDocument();
    });

    it('should display array result as list', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_listings',
        status: 'success',
        result: ['Listing 1', 'Listing 2', 'Listing 3'],
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Listing 1')).toBeInTheDocument();
      expect(screen.getByText('Listing 2')).toBeInTheDocument();
      expect(screen.getByText('Listing 3')).toBeInTheDocument();
    });

    it('should display array of objects as list', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_listings',
        status: 'success',
        result: [
          { id: 1, name: 'Pizza' },
          { id: 2, name: 'Salad' },
        ],
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getAllByText(/id/)).toHaveLength(2);
    });

    it('should display empty array message', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_listings',
        status: 'success',
        result: [],
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Empty list')).toBeInTheDocument();
    });

    it('should display null result as "No result"', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_data',
        status: 'success',
        result: null,
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('No result')).toBeInTheDocument();
    });

    it('should display undefined result as "No result"', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_data',
        status: 'success',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('No result')).toBeInTheDocument();
    });
  });

  describe('Error Status', () => {
    it('should display error badge when status is error', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'error',
        error: 'Network error',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-red-700');
    });

    it('should display error icon', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'error',
        error: 'Network error',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const errorIcon = container.querySelector('.bg-red-100 svg');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should display error message', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'error',
        error: 'Failed to fetch listings',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch listings')).toBeInTheDocument();
    });

    it('should display error with special characters', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'error',
        error: 'Error: Invalid query & parameters',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText(/Invalid query & parameters/)).toBeInTheDocument();
    });
  });

  describe('Tool Name Formatting', () => {
    it('should format snake_case tool names to Title Case', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_food_listings',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Search Food Listings')).toBeInTheDocument();
    });

    it('should format single word tool names', () => {
      const toolCall: ToolCall = {
        tool_name: 'logout',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should format tool names with multiple underscores', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_user_dietary_preferences',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('Get User Dietary Preferences')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role and aria-live attributes', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'executing',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const feedback = container.querySelector('[role="status"]');
      expect(feedback).toHaveAttribute('aria-live', 'polite');
    });

    it('should have descriptive aria-label', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: { count: 5 },
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const feedback = container.querySelector('[role="status"]');
      expect(feedback).toHaveAttribute('aria-label', expect.stringContaining('Search Listings'));
      expect(feedback).toHaveAttribute('aria-label', expect.stringContaining('success'));
    });

    it('should have aria-hidden on decorative icons', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: { count: 5 },
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have aria-label on loading spinner', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      const spinner = screen.getByRole('status', { name: /search_listings is executing/ });
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have correct container styling', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'executing',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const feedback = container.querySelector('[role="status"]');
      expect(feedback).toHaveClass('bg-blue-50');
      expect(feedback).toHaveClass('border');
      expect(feedback).toHaveClass('border-blue-200');
      expect(feedback).toHaveClass('rounded-lg');
      expect(feedback).toHaveClass('p-3');
    });

    it('should have result container with correct styling', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: 'Test result',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const resultContainer = container.querySelector('.bg-white');
      expect(resultContainer).toHaveClass('rounded');
      expect(resultContainer).toHaveClass('p-2');
      expect(resultContainer).toHaveClass('border');
    });

    it('should have error container with correct styling', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'error',
        error: 'Test error',
      };
      const { container } = render(<ToolExecutionFeedback toolCall={toolCall} />);

      const errorContainer = container.querySelector('.bg-white');
      expect(errorContainer).toHaveClass('border-red-100');
    });
  });

  describe('Data Attributes', () => {
    it('should have test id for testing', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'executing',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByTestId('tool-execution-feedback')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle result with nested objects', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_complex_data',
        status: 'success',
        result: {
          user: { name: 'John', age: 30 },
          listings: [1, 2, 3],
        },
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('user:')).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longError = 'Error: ' + 'x'.repeat(200);
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'error',
        error: longError,
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText(new RegExp(longError.substring(0, 50)))).toBeInTheDocument();
    });

    it('should handle result with special characters', () => {
      const toolCall: ToolCall = {
        tool_name: 'search_listings',
        status: 'success',
        result: 'Result with special chars: & < > " \'',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText(/Result with special chars:/)).toBeInTheDocument();
    });

    it('should handle empty string result', () => {
      const toolCall: ToolCall = {
        tool_name: 'get_data',
        status: 'success',
        result: '',
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByTestId('tool-execution-feedback')).toBeInTheDocument();
    });

    it('should handle result with zero value', () => {
      const toolCall: ToolCall = {
        tool_name: 'count_items',
        status: 'success',
        result: 0,
      };
      render(<ToolExecutionFeedback toolCall={toolCall} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
