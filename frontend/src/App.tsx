
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Header from './components/Header';
import { api } from './api/client';
import type { Message, KnowledgeBaseStatus, SystemStatus } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [kbStatus, setKbStatus] = useState<KnowledgeBaseStatus | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadStatuses();
    const interval = setInterval(loadStatuses, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStatuses = async () => {
    try {
      const [kb, sys] = await Promise.all([
        api.getKnowledgeBaseStatus(),
        api.getSystemStatus(),
      ]);
      setKbStatus(kb);
      setSystemStatus(sys);
    } catch (error) {
      console.error('Failed to load statuses:', error);
    }
  };

  const handleSendMessage = async (content: string, useStream: boolean, explain: boolean) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: useStream,
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      if (useStream) {
        await api.askStream(
          { question: content, explain },
          (chunk) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              )
            );
          },
          () => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
            setIsLoading(false);
          },
          (error) => {
            console.error('Stream error:', error);
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: `抱歉，回答生成过程中出现错误：${error.message}`, isStreaming: false }
                  : msg
              )
            );
            setIsLoading(false);
          }
        );
      } else {
        const response = await api.ask({
          question: content,
          stream: false,
          explain,
        });

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: response.data.answer, isStreaming: false }
              : msg
          )
        );
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: error.response?.data?.detail || error.message || '抱歉，发送消息失败。请确保知识库已加载。',
                isStreaming: false
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster position="top-right" />

      <Sidebar
        isOpen={sidebarOpen}
        kbStatus={kbStatus}
        systemStatus={systemStatus}
        onRefresh={loadStatuses}
        onClearChat={handleClearChat}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          kbReady={kbStatus?.knowledge_base_loaded || false}
        />

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          kbReady={kbStatus?.knowledge_base_loaded || false}
        />
      </div>
    </div>
  );
}

export default App;