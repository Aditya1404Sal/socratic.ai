
        import { GoogleGenerativeAI } from '@google/generative-ai';
        import { NextResponse } from 'next/server';
        
        export async function POST(req) {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const data = await req.json();
                const prompt = `${data.body}. prompt goes here`;
                
                const result = await model.generateContent(prompt);
                return NextResponse.json({ code: result.response.text() });
            } catch (error) {
                console.error(error);
                return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
            }
        }