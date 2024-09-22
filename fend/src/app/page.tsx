// pages/index.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

export default function Home() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');

    const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userMessage: Message = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const response = await axios.post('/api/generate', { messages: [...messages, userMessage] });

            const botMessage: Message = { text: response.data.response, sender: 'bot' };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = { text: "Sorry, there was an error communicating with the AI.", sender: 'bot' };
            setMessages((prev) => [...prev, errorMessage]);
        }

        setInput('');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h1>Socratic AI Tutor</h1>
            <div style={{ border: '1px solid #ccc', padding: '10px', height: '400px', overflowY: 'scroll', marginBottom: '10px' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                        <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
                    </div>
                ))}
            </div>
            <form onSubmit={sendMessage} style={{ display: 'flex' }}>
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="Type your message..." 
                    required 
                    style={{ flexGrow: 1, padding: '10px', marginRight: '10px' }}
                />
                <button type="submit" style={{ padding: '10px' }}>Send</button>
            </form>
        </div>
    );
}