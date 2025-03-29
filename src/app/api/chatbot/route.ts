import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message }: { message: string } = body;

    const hour = new Date().getHours();
    let dayTime = '';
    if (hour < 12) dayTime = 'morning';
    else if (hour < 18) dayTime = 'afternoon';
    else dayTime = 'night';

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant giving health advice to diabetic users based on their glucose levels and the current time.',
        },
        {
          role: 'user',
          content: `It is currently ${dayTime}. ${message}`,
        },
      ],
    });

    const aiMessage = response.choices[0].message?.content || 'No response.';
    return NextResponse.json({ reply: aiMessage });
  } catch (error) {
    console.error('Chatbot api error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
