import { Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-4 ${
        isUser ? 'justify-end' : 'justify-start'
      } chat-message`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}

      <div
        className={`flex-1 max-w-3xl ${
          isUser
            ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md'
            : 'bg-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-md border border-gray-100'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <>
            {message.isStreaming && !message.content && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">正在思考...</span>
              </div>
            )}
            {message.content && (
              <div className="markdown-content text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            {message.isStreaming && message.content && (
              <div className="mt-2 flex items-center gap-2 text-primary-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">正在生成...</span>
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-md">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
}
