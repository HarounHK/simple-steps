import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { connectMongoDB } from '@/app/lib/mongodb';
import User from '@/app/models/user';
import Glucose from '@/app/models/glucose';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Define a user shape for clarity
type ProfileUser = {
  _id: string;
  name: string;
  age: number;
  sex: string;
  height: number;
  weight: number;
  diabetesType: string;
  targetWeight: number;
  activityLevel: string;
  trackingMode: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message }: { message: string } = body;

    const session = await getServerSession({ req: request, ...authOptions });
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();

    const userDoc = await User.findOne({ email: session.user.email }).lean();

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fix TypeScript error by telling TS what this structure is
    const user = userDoc as ProfileUser;

    const glucoseData = await Glucose.find({ userId: user._id })
      .sort({ timeOfMeasurement: -1 })
      .limit(30)
      .lean();

    const glucoseSummary = glucoseData
      .map((entry) => {
        const time = new Date(entry.timeOfMeasurement).toLocaleString();
        return `At ${time}, glucose was ${entry.glucoseLevel} mg/dL (${entry.mealContext}, ${entry.source}).`;
      })
      .join('\n');

    const hour = new Date().getHours();
    const dayTime = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'night';

    const profileSummary = `
      Name: ${user.name}
      Age: ${user.age}
      Sex: ${user.sex}
      Height: ${user.height} cm
      Weight: ${user.weight} kg
      Diabetes Type: ${user.diabetesType}
      Target Weight: ${user.targetWeight} kg
      Activity Level: ${user.activityLevel}
      Tracking Mode: ${user.trackingMode}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant supporting diabetic users. You have access to their profile and glucose readings. Always answer using exact profile values or recent glucose data. Be concise but medically accurate. If no data is found, say so.`,
        },
        {
          role: 'user',
          content: `It is currently ${dayTime}.
      User profile:
      ${profileSummary}

      Recent glucose readings:
      ${glucoseSummary}

      User's question: ${message}`,
        },
      ],
    });

    const aiMessage = response.choices[0].message?.content || 'No response.';
    return NextResponse.json({ reply: aiMessage });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
