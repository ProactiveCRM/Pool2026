'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export interface BallPosition {
    type: 'cue' | 'solid' | 'stripe' | '8ball';
    number?: number;
    x: number; // 0-100 percentage of table width
    y: number; // 0-100 percentage of table height
    color: string;
}

export interface ShotSuggestion {
    targetBall: number;
    pocketTarget: string;
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    cueBallPath?: { x: number; y: number }[];
    objectBallPath?: { x: number; y: number }[];
}

export interface AnalysisResult {
    success: boolean;
    balls?: BallPosition[];
    suggestions?: ShotSuggestion[];
    gameState?: string;
    error?: string;
}

const ANALYZER_PROMPT = `You are an expert pool table analyzer. Analyze this image of a pool table and identify:

1. **Ball Positions**: List each visible ball with:
   - Type: "cue" (white), "solid" (1-7), "stripe" (9-15), or "8ball"
   - Number (if visible)
   - Position as X,Y percentages (0-100) from top-left of the table
   - Color

2. **Shot Suggestions**: Provide 2-3 best shots to play, each with:
   - Target ball number
   - Target pocket (e.g., "top-left", "side-right", "bottom-left")
   - Difficulty rating
   - Brief description of the shot

3. **Game State**: Current game situation (e.g., "open table", "shooting solids", "8-ball game")

Respond in this exact JSON format:
{
  "balls": [
    {"type": "cue", "x": 50, "y": 75, "color": "white"},
    {"type": "solid", "number": 1, "x": 30, "y": 40, "color": "yellow"},
    ...
  ],
  "suggestions": [
    {
      "targetBall": 1,
      "pocketTarget": "top-left",
      "difficulty": "easy",
      "description": "Straight shot to corner pocket"
    }
  ],
  "gameState": "Open table - any ball can be targeted"
}

If you cannot clearly see a pool table, respond with: {"error": "Could not detect pool table in image"}`;

export async function analyzePoolTable(imageBase64: string): Promise<AnalysisResult> {
    try {
        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return {
                success: false,
                error: 'API key not configured. Add GOOGLE_GEMINI_API_KEY to your environment.',
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

        const result = await model.generateContent([
            ANALYZER_PROMPT,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                },
            },
        ]);

        const responseText = result.response.text();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return {
                success: false,
                error: 'Could not parse analysis result',
            };
        }

        const analysis = JSON.parse(jsonMatch[0]);

        if (analysis.error) {
            return {
                success: false,
                error: analysis.error,
            };
        }

        return {
            success: true,
            balls: analysis.balls || [],
            suggestions: analysis.suggestions || [],
            gameState: analysis.gameState,
        };
    } catch (error) {
        console.error('Shot analysis error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to analyze image',
        };
    }
}
