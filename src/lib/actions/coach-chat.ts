'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { COACH_SYSTEM_PROMPT } from '@/lib/prompts/coach-system';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function sendCoachMessage(
    message: string,
    history: ChatMessage[]
): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return {
                success: false,
                error: 'Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY to your environment.',
            };
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: COACH_SYSTEM_PROMPT,
        });

        // Convert history to Gemini format
        const chatHistory = history.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return {
            success: true,
            response,
        };
    } catch (error) {
        console.error('Coach chat error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get response',
        };
    }
}
