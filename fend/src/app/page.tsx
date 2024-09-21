'use client';
import { error } from "console";
import { useState } from "react";

export default function Home(){
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');

  const handleGenerate = async () => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ body: prompt }),
        });

        const data = await response.json();

        if (response.ok) {
            setContent(data.code);
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
  return (
    <div className="p-4">
        <h1 className="text-xl font-bold">AI UI Generator</h1>
        <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="Enter your prompt here..." 
            className="border p-2 w-full h-32"
        />
        <button onClick={handleGenerate} className="bg-blue-500 text-white p-2 mt-2">
            Enter
        </button>
        <div className="mt-4">
            <h2 className="text-lg">Generated Code:</h2>
            <pre className="bg-gray-100 p-2">{content}</pre>
        </div>
    </div>
);
}