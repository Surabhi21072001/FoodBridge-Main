import React from 'react';
import Button from '../shared/Button';

interface QuickActionsProps {
  onActionClick: (message: string) => void;
  disabled?: boolean;
  role?: 'student' | 'provider' | 'admin';
}

/**
 * QuickActions Component
 * 
 * Displays suggested quick action buttons for common chat tasks.
 * Allows users to quickly send predefined messages to the AI assistant.
 * 
 * Requirements:
 * - Display suggested prompts above chat input (Requirement 10.3)
 * - Implement quick action buttons (Find discounted food, Book pantry appointment, Show dining deals, Show food events)
 * - Send message to AI agent when quick action is clicked
 * - Provider role sees provider-relevant actions only
 */
const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, disabled = false, role }) => {
  const allQuickActions = [
    {
      id: 'find-discounted',
      label: 'Find discounted food',
      message: 'Show me discounted food listings available today',
      roles: ['student', 'admin'],
    },
    {
      id: 'book-pantry',
      label: 'Book pantry appointment',
      message: 'Help me book a pantry appointment',
      roles: ['student', 'admin'],
    },
    {
      id: 'dining-deals',
      label: 'Show dining deals',
      message: 'What dining deals are available?',
      roles: ['student', 'admin'],
    },
    {
      id: 'food-events',
      label: 'Show food events',
      message: 'Tell me about upcoming food events',
      roles: ['student', 'admin'],
    },
    {
      id: 'my-listings',
      label: 'View my listings',
      message: 'Show me my current food listings',
      roles: ['provider'],
    },
    {
      id: 'provider-reservations',
      label: 'View reservations',
      message: 'Show me reservations for my listings',
      roles: ['provider'],
    },
  ];

  const quickActions = role
    ? allQuickActions.filter((a) => a.roles.includes(role))
    : allQuickActions.filter((a) => a.roles.includes('student'));

  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      {quickActions.map((action) => (
        <Button
          key={action.id}
          onClick={() => onActionClick(action.message)}
          disabled={disabled}
          variant="secondary"
          size="sm"
          className="text-xs"
          data-testid={`quick-action-${action.id}`}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;
