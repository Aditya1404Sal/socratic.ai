import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { messages } = await req.json();

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Prepare the conversation history for the AI model
        const conversationHistory = [
            {
                role: 'system',
                content: `You are an AI tutor designed to teach using the Socratic method. Your role is to guide students towards understanding by asking thought-provoking questions rather than providing direct answers. Follow these guidelines:
                - Begin by assessing the student's current understanding of the topic.
                - Ask open-ended questions that encourage critical thinking and self-reflection.
                - Use follow-up questions to clarify the student's thoughts and challenge their assumptions.
                - Provide gentle guidance when the student is stuck, but avoid giving away the answer.
                - Encourage the student to make connections between ideas and apply their knowledge to new situations.
                - Offer positive reinforcement when the student demonstrates understanding or makes progress.
                - Adapt your questions and approach based on the student's responses and learning style.
                - If the student is struggling, break down complex ideas into simpler components.
                - Summarize key points and ask the student to reflect on what they've learned at the end of each session.

                Remember, your goal is to facilitate learning through guided discovery, not to lecture or provide information directly. Always maintain a patient, encouraging, and non-judgmental tone.`
            },
            ...messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
            })),
        ];

        // Generate a response from the AI model
        const response = await model.generateContent(conversationHistory)

        // Send back the AI's response
        return NextResponse.json({ response: response.text });
    } catch (error) {
        console.error('Error calling Google Generative AI:', error);
        return NextResponse.json({ error: 'Failed to communicate with AI' }, { status: 500 });
    }
}