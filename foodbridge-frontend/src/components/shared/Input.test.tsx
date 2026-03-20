import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Input from './Input';

describe('Input Component', () => {
  describe('Base Input Rendering', () => {
    it('should render an input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with label when provided', () => {
      render(<Input label="Email" />);
      const label = screen.getByText('Email');
      expect(label).toBeInTheDocument();
    });

    it('should render required indicator when required prop is true', () => {
      render(<Input label="Email" required />);
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('should accept input value', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'test value');
      expect(input.value).toBe('test value');
    });

    it('should support different input types', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      render(<Input error="This field is required" />);
      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should have error styling when error is present', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-danger-500');
      expect(input).toHaveClass('bg-danger-50');
    });

    it('should set aria-invalid to true when error is present', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby to error id when error is present', () => {
      render(<Input id="email-input" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-input-error');
    });

    it('should not display helper text when error is present', () => {
      render(<Input error="Error message" helperText="Helper text" />);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('should have error role alert for accessibility', () => {
      render(<Input error="This field is required" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('should have disabled styling when disabled is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-gray-100');
      expect(input).toHaveClass('cursor-not-allowed');
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled defaultValue="" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'test');
      expect(input.value).toBe('');
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided and no error', () => {
      render(<Input helperText="Enter a valid email address" />);
      const helperText = screen.getByText('Enter a valid email address');
      expect(helperText).toBeInTheDocument();
    });

    it('should set aria-describedby to helper text id when helper text is present', () => {
      render(<Input id="email-input" helperText="Helper text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'email-input-helper');
    });

    it('should not display helper text when error is present', () => {
      render(<Input error="Error" helperText="Helper text" />);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<Input id="test-input" label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should generate unique id when not provided', () => {
      const { rerender } = render(<Input label="First" />);
      const firstInput = screen.getByRole('textbox') as HTMLInputElement;
      const firstId = firstInput.id;

      rerender(<Input label="Second" />);
      const secondInput = screen.getByRole('textbox') as HTMLInputElement;
      const secondId = secondInput.id;

      expect(firstId).not.toBe(secondId);
    });

    it('should support placeholder text', () => {
      render(<Input placeholder="Enter email" />);
      const input = screen.getByPlaceholderText('Enter email');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have normal border styling when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300');
    });

    it('should have focus ring styling', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2');
      expect(input).toHaveClass('focus:ring-offset-2');
    });

    it('should accept custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through standard HTML attributes', () => {
      render(<Input name="email" data-testid="email-input" />);
      const input = screen.getByTestId('email-input');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('should support value prop', () => {
      render(<Input value="test@example.com" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
    });

    it('should support onChange callback', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'a');
      expect(handleChange).toHaveBeenCalled();
    });
  });
});
