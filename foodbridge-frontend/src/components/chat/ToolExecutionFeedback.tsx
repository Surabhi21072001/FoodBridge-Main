import React from 'react';
import type { ToolCall } from '../../types/chat';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { renderToolResult } from '../../utils/renderToolResult';

interface ToolExecutionFeedbackProps {
  toolCall: ToolCall;
}

/**
 * Displays feedback about tool execution status, loading indicators, and formatted results.
 * 
 * Requirements:
 * - Display tool execution status (Requirement 10.5)
 * - Show loading indicator during execution (Requirement 10.5)
 * - Display formatted results (Requirement 10.6)
 */
const ToolExecutionFeedback: React.FC<ToolExecutionFeedbackProps> = ({ toolCall }) => {
  const { tool_name, name, status, result, error } = toolCall;
  const toolNameToUse = tool_name || name || 'Unknown Tool';

  // Format tool name for display (convert snake_case to Title Case)
  const formatToolName = (toolName: string): string => {
    return toolName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2"
      role="status"
      aria-live="polite"
      aria-label={`Tool execution: ${formatToolName(toolNameToUse)} - ${status}`}
      data-testid="tool-execution-feedback"
    >
      {/* Tool Name and Status */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-blue-900">
          {formatToolName(toolNameToUse)}
        </span>

        {/* Status Badge */}
        {status === 'executing' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            <LoadingSpinner size="sm" ariaLabel={`${toolNameToUse} is executing`} />
            Executing
          </span>
        )}

        {status === 'success' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Success
          </span>
        )}

        {status === 'error' && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Error
          </span>
        )}
      </div>

      {/* Result or Error Message */}
      {status === 'success' && (
        <div className="text-sm text-blue-900 bg-white rounded p-2 border border-blue-100">
          {result !== undefined ? renderToolResult(toolNameToUse, result) : 'No result'}
        </div>
      )}

      {status === 'error' && error && (
        <div className="text-sm text-red-900 bg-white rounded p-2 border border-red-100">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {status === 'executing' && (
        <div className="text-sm text-blue-700">
          Processing {formatToolName(toolNameToUse)}...
        </div>
      )}
    </div>
  );
};

export default ToolExecutionFeedback;
