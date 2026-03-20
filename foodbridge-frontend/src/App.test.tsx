import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the login page for unauthenticated users', () => {
    render(<App />);
    expect(screen.getByText('FoodBridge')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('renders login and register links on login page', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('displays sign up link on login page', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });
});
