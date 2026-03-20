import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToastContext } from './ToastContext';

describe('ToastContext', () => {
  const TestComponent = () => {
    const { showToast, success, error, warning, info } = useToastContext();

    return (
      <div>
        <button onClick={() => showToast('Generic toast', 'info')}>
          Show Generic
        </button>
        <button onClick={() => success('Success message')}>
          Show Success
        </button>
        <button onClick={() => error('Error message')}>
          Show Error
        </button>
        <button onClick={() => warning('Warning message')}>
          Show Warning
        </button>
        <button onClick={() => info('Info message')}>
          Show Info
        </button>
      </div>
    );
  };

  it('throws error when useToastContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToastContext must be used within a ToastProvider');

    consoleErrorSpy.mockRestore();
  });

  it('provides toast context within provider', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Show Generic')).toBeInTheDocument();
    expect(screen.getByText('Show Success')).toBeInTheDocument();
    expect(screen.getByText('Show Error')).toBeInTheDocument();
    expect(screen.getByText('Show Warning')).toBeInTheDocument();
    expect(screen.getByText('Show Info')).toBeInTheDocument();
  });

  it('provides success shortcut method', () => {
    const TestSuccessComponent = () => {
      const { success } = useToastContext();
      const [called, setCalled] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              success('Success!');
              setCalled(true);
            }}
          >
            Test Success
          </button>
          {called && <span>Success called</span>}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestSuccessComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test Success')).toBeInTheDocument();
  });

  it('provides error shortcut method', () => {
    const TestErrorComponent = () => {
      const { error } = useToastContext();
      const [called, setCalled] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              error('Error!');
              setCalled(true);
            }}
          >
            Test Error
          </button>
          {called && <span>Error called</span>}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestErrorComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('provides warning shortcut method', () => {
    const TestWarningComponent = () => {
      const { warning } = useToastContext();
      const [called, setCalled] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              warning('Warning!');
              setCalled(true);
            }}
          >
            Test Warning
          </button>
          {called && <span>Warning called</span>}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestWarningComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test Warning')).toBeInTheDocument();
  });

  it('provides info shortcut method', () => {
    const TestInfoComponent = () => {
      const { info } = useToastContext();
      const [called, setCalled] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              info('Info!');
              setCalled(true);
            }}
          >
            Test Info
          </button>
          {called && <span>Info called</span>}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestInfoComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test Info')).toBeInTheDocument();
  });

  it('provides dismissToast method', () => {
    const TestDismissComponent = () => {
      const { dismissToast } = useToastContext();
      const [called, setCalled] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              dismissToast('test-id');
              setCalled(true);
            }}
          >
            Test Dismiss
          </button>
          {called && <span>Dismiss called</span>}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestDismissComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test Dismiss')).toBeInTheDocument();
  });

  it('provides clearAll method', () => {
    const TestClearComponent = () => {
      const { clearAll } = useToastContext();
      const [called, setCalled] = React.useState(false);

      return (
        <div>
          <button
            onClick={() => {
              clearAll();
              setCalled(true);
            }}
          >
            Test Clear
          </button>
          {called && <span>Clear called</span>}
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestClearComponent />
      </ToastProvider>
    );

    expect(screen.getByText('Test Clear')).toBeInTheDocument();
  });
});
