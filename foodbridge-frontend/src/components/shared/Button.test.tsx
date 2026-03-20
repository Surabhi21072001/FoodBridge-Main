import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  describe('Variants', () => {
    it('renders primary variant with correct styles', () => {
      render(<Button variant="primary">Primary Button</Button>);
      const button = screen.getByRole('button', { name: /primary button/i });
      expect(button).toHaveClass('bg-primary-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders secondary variant with correct styles', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button', { name: /secondary button/i });
      expect(button).toHaveClass('bg-secondary-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders danger variant with correct styles', () => {
      render(<Button variant="danger">Danger Button</Button>);
      const button = screen.getByRole('button', { name: /danger button/i });
      expect(button).toHaveClass('bg-danger-600');
      expect(button).toHaveClass('text-white');
    });

    it('renders ghost variant with correct styles', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      const button = screen.getByRole('button', { name: /ghost button/i });
      expect(button).toHaveClass('bg-transparent');
      expect(button).toHaveClass('text-gray-700');
    });

    it('defaults to primary variant when no variant specified', () => {
      render(<Button>Default Button</Button>);
      const button = screen.getByRole('button', { name: /default button/i });
      expect(button).toHaveClass('bg-primary-600');
    });
  });

  describe('Sizes', () => {
    it('renders small size with correct styles', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button', { name: /small button/i });
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('renders medium size with correct styles', () => {
      render(<Button size="md">Medium Button</Button>);
      const button = screen.getByRole('button', { name: /medium button/i });
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-base');
    });

    it('renders large size with correct styles', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });

    it('defaults to medium size when no size specified', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button', { name: /default size/i });
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when isLoading is true', () => {
      render(<Button isLoading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when isLoading is true', () => {
      render(<Button isLoading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      expect(button).toBeDisabled();
    });

    it('does not display spinner when isLoading is false', () => {
      render(<Button isLoading={false}>Normal Button</Button>);
      const button = screen.getByRole('button', { name: /normal button/i });
      const spinner = button.querySelector('svg');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
    });

    it('applies disabled opacity styles', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('does not trigger onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not trigger onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button isLoading onClick={handleClick}>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Click Handler', () => {
    it('triggers onClick when button is clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be clicked multiple times', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Custom Props', () => {
    it('accepts and applies custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole('button', { name: /custom button/i });
      expect(button).toHaveClass('custom-class');
    });

    it('forwards additional HTML button attributes', () => {
      render(<Button type="submit" data-testid="submit-btn">Submit</Button>);
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('data-testid', 'submit-btn');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus styles', () => {
      render(<Button>Focus Button</Button>);
      const button = screen.getByRole('button', { name: /focus button/i });
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-offset-2');
    });

    it('spinner has aria-hidden attribute', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      const spinner = button.querySelector('svg');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
