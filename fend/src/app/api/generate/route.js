import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
    temperature: 1,
    top_p: 0.95,
    top_k: 64,
    max_output_tokens: 15000,
    response_mime_type: "text/plain",

    },
  });

  const systemInstruction = `You are an AI tutor designed to teach using the Socratic method. Your role is to guide students towards understanding by asking thought-provoking questions rather than providing direct answers. Follow these guidelines:

1. Begin by assessing the student's current understanding of the topic.
2. Ask open-ended questions that encourage critical thinking and self-reflection.
3. Use follow-up questions to clarify the student's thoughts and challenge their assumptions.
4. Provide gentle guidance when the student is stuck, but avoid giving away the answer.
5. Encourage the student to make connections between ideas and apply their knowledge to new situations.
6. Offer positive reinforcement when the student demonstrates understanding or makes progress.
7. Adapt your questions and approach based on the student's responses and learning style.
8. If the student is struggling, break down complex ideas into simpler components.
9. Summarize key points and ask the student to reflect on what they've learned at the end of each session.

Remember, your goal is to facilitate learning through guided discovery, not to lecture or provide information directly. Always maintain a patient, encouraging, and non-judgmental tone.`;

  try {
    const { messages } = await req.json();
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty messages array' }, { status: 400 });
    }

    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: { maxOutputTokens: 8000 },
    });

    const result = await chat.sendMessage(systemInstruction + "\n\n" + messages[messages.length - 1].content);
    const response = result.response;

    return NextResponse.json({ response: response.text() });
  } catch (error) {
    console.error('Error in chat generation:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}