import React from 'react';
import type { Message } from '../../types/chat';

interface ChatMessageProps {
  message: Message;
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => {
  const renderMarkdownLine = (line: string, lineIndex: number): React.ReactNode => {
    const boldRegex = /\*\*(.+?)\*\*/g;
    const italicRegex = /_(.+?)_/g;
    const linkRegex = /\[(.+?)\]\((.+?)\)/g;
    const codeRegex = /`(.+?)`/g;

    const allMatches: Array<{ start: number; end: number; type: string; text: string; url?: string }> = [];
    let match;

    boldRegex.lastIndex = 0;
    while ((match = boldRegex.exec(line)) !== null)
      allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'bold', text: match[1] });

    italicRegex.lastIndex = 0;
    while ((match = italicRegex.exec(line)) !== null)
      allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'italic', text: match[1] });

    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(line)) !== null)
      allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'link', text: match[1], url: match[2] });

    codeRegex.lastIndex = 0;
    while ((match = codeRegex.exec(line)) !== null)
      allMatches.push({ start: match.index, end: match.index + match[0].length, type: 'code', text: match[1] });

    allMatches.sort((a, b) => a.start - b.start);

    const filtered: typeof allMatches = [];
    let lastEnd = 0;
    for (const m of allMatches) {
      if (m.start >= lastEnd) { filtered.push(m); lastEnd = m.end; }
    }

    const elements: React.ReactNode[] = [];
    let cursor = 0;
    filtered.forEach((m, idx) => {
      if (cursor < m.start) elements.push(line.substring(cursor, m.start));
      if (m.type === 'bold') elements.push(<strong key={idx} className="font-semibold">{m.text}</strong>);
      else if (m.type === 'italic') elements.push(<em key={idx} className="italic">{m.text}</em>);
      else if (m.type === 'link') elements.push(<a key={idx} href={m.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">{m.text}</a>);
      else if (m.type === 'code') elements.push(<code key={idx} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">{m.text}</code>);
      cursor = m.end;
    });
    if (cursor < line.length) elements.push(line.substring(cursor));

    return <div key={lineIndex}>{elements.length > 0 ? elements : line || '\u00A0'}</div>;
  };

  const formatTime = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const lines = message.content.split('\n');

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${isUser ? 'bg-blue-600' : 'bg-primary-600'}`}
        aria-hidden="true"
      >
        {isUser ? 'You' : 'AI'}
      </div>

      <div className={`flex-1 max-w-xs lg:max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block px-4 py-2 rounded-lg ${
            isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          <div className="text-sm leading-relaxed break-words">
            {lines.map((line, i) => renderMarkdownLine(line, i))}
          </div>
        </div>

        <div
          className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}
          aria-label={`Sent at ${formatTime(message.timestamp)}`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
