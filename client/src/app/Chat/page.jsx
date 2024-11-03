'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function Chat() {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previousChats, setPreviousChats] = useState(['Chat 1', 'Chat 2']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError('');

    const userMessage = { sender: 'user', content: prompt };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...chatHistory, userMessage] }),
      });

      const data = await response.json();

      if (response.ok) {
        const botMessage = { sender: 'bot', content: data.response };
        setChatHistory(prev => [...prev, botMessage]);
      } else {
        setError(data.error || 'An error occurred while fetching the response.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-800/50 backdrop-blur-md overflow-hidden`}>
        <div className="p-4 min-w-[16rem]">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-white font-bold">Previous Chats</h2>
          </div>
          <div className="space-y-2">
            {previousChats.map((chat, index) => (
              <div key={index} className="p-2 hover:bg-gray-700 rounded cursor-pointer text-gray-300">
                {chat}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-40 backdrop-blur-md bg-gray-900/10 p-4 text-center border-b border-gray-700">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 text-white p-2 hover:bg-gray-700 rounded z-50"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold text-white">SocraticAI</h1>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center text-gray-400">Bot is typing...</div>
          )}
          {error && (
            <div className="text-center text-red-500">{error}</div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800">
          <div className="flex items-end gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 resize-none scrollbar-hide overflow-hidden min-h-[48px]"
              rows="1"
              style={{ height: '48px' }}
            />

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 h-[40px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 flex-shrink-0"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
