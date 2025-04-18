import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { connectMongoDB } from '@/app/lib/mongodb';
import User from '@/app/models/user';
import Glucose from '@/app/models/glucose';
import Nutrition from '@/app/models/nutrition'; 
import Exercise from '@/app/models/exercise';  

// Define a user shape for clear type casting
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

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message }: { message: string } = body;

    // Get session using app router-compatible syntax
    // @ts-expect-error Deployment type error
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Fetch user and assert type
    const userDoc = await User.findOne({ email: session.user.email })
      .lean()
      .select("_id name age sex height weight diabetesType targetWeight activityLevel trackingMode");

    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // @ts-expect-error Deployment type error
    const user = userDoc as ProfileUser;

    // Get last 30 glucose readings
    const glucoseData = await Glucose.find({ userId: user._id })
      .sort({ timeOfMeasurement: -1 })
      .limit(30)
      .lean();

    // ygm: Get recent nutrition entries (last 7 logs)
    const nutritionData = await Nutrition.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(7)
      .lean();

    const nutritionSummary = nutritionData.length
    ? nutritionData
        .map((entry) => {
          const time = new Date(entry.date).toLocaleString();
          return `At ${time}, had ${entry.foodName} (${entry.grams}g) = ${entry.calories} kcal, ${entry.carbs}g carbs, ${entry.protein}g protein, ${entry.fat}g fat, ${entry.sugar}g sugar.`;
        })
        .join('\n')      
      : 'No recent nutrition data.';

    // Get recent exercise entries (last 7 logs)
    const exerciseData = await Exercise.find({ userId: user._id })
    .sort({ date: -1 }) 
    .limit(7)
    .lean();

    const exerciseSummary = exerciseData.length
    ? exerciseData
        .map((entry) => {
          const time = new Date(entry.date).toLocaleDateString() + " at " + entry.time;
          return `On ${time}, did ${entry.activityName}, burned ${entry.caloriesBurned} kcal.`;
        })
        .join('\n')
    : 'No recent exercise data.';

    // Format glucose readings into readable lines
    const glucoseSummary = glucoseData
      .map((entry) => {
        const time = new Date(entry.timeOfMeasurement).toLocaleString();
        return `At ${time}, glucose was ${entry.glucoseLevel} mg/dL (${entry.mealContext}, ${entry.source}).`;
      })
      .join('\n');

    // Set morning/afternoon/night based on current hour
    const hour = new Date().getHours();
    const dayTime = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'night';

    // Build profile summary for the AI prompt
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

    // Send prompt to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant supporting diabetic users. You have access to their profile, glucose readings and nutrition and exercise logs. Always answer using exact profile values or recent glucose data. Be concise but medically accurate. If no data is found, say so.`,
        },
        {
          role: 'user',
          content: `It is currently ${dayTime}.\nUser profile:\n${profileSummary}\n\nRecent glucose readings:\n${glucoseSummary}\n\nRecent meals and nutrition:\n${nutritionSummary}\n\nRecent exercise activity::\n${exerciseSummary}\n\nUser's question: ${message}`,
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
