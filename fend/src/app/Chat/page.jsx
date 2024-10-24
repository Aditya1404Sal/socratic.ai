'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return; // Prevent sending empty messages
    setIsLoading(true);
    setError('');

    // Update chat history with user message
    const userMessage = { sender: 'user', content: prompt };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...chatHistory, userMessage] }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update chat history with bot response
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
      setPrompt(''); // Clear input field after sending
    }
  };

  return (
    <div className="p-4 h-screen w-screen flex flex-col">
      <h1 className="text-2xl font-bold text-center mb-4">Socratic.AI</h1>
      <div ref={chatContainerRef} className="overflow-y-auto flex-grow border border-gray-300 rounded-lg p-2 mb-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-500">Bot is typing...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
      </div>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder="Type your message..." 
        className="border p-2 w-full h-20 rounded-lg"
      />
      <button 
        onClick={handleGenerate} 
        disabled={isLoading}
        className="bg-blue-500 text-white p-2 mt-2 w-full rounded-lg disabled:bg-blue-300"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
);
}