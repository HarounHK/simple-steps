import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { connectMongoDB } from "@/app/lib/mongodb";
import User from "@/app/models/user";
import Glucose from "@/app/models/glucose";
import Nutrition from "@/app/models/nutrition";
import Exercise from "@/app/models/exercise";
import Chat from "@/app/models/chat";

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function getWeeklyAverages(entries: { timeOfMeasurement: string | Date; glucoseLevel: number }[]): string {
  const now = new Date();
  const buckets: Record<string, number[]> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.timeOfMeasurement);
    const weeksAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const label = `Week ${weeksAgo} ago`;
    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(entry.glucoseLevel);
  });

  return Object.entries(buckets)
    .sort((a, b) => parseInt(a[0].split(" ")[1]) - parseInt(b[0].split(" ")[1]))
    .map(([week, levels]) => {
      const avg = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
      return `${week}: Avg ${avg} mg/dL`;
    })
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, chatId }: { message: string; chatId?: string } = body;

    // @ts-expect-error ✅ you asked for this to stay
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const userDoc = await User.findOne({ email: session.user.email })
      .lean()
      .select("_id name age sex height weight diabetesType targetWeight activityLevel trackingMode");

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // @ts-expect-error ✅ you asked for this to stay
    const user = userDoc as ProfileUser;

    const glucoseData = await Glucose.find({ userId: user._id })
      .sort({ timeOfMeasurement: 1 })
      .lean();

    // @ts-expect-error ✅ you asked for this to stay
    const weeklyStats = getWeeklyAverages(glucoseData);

    const recentGlucose = [...glucoseData]
      .slice(-10)
      .map((entry) => {
        const time = new Date(entry.timeOfMeasurement).toLocaleString();
        return `At ${time}, glucose was ${entry.glucoseLevel} mg/dL (${entry.mealContext}, ${entry.source}).`;
      })
      .join("\n");

    const nutritionData = await Nutrition.find({ userId: user._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const nutritionSummary = nutritionData.length
      ? nutritionData
          .map((entry) => {
            const time = new Date(entry.date).toLocaleString();
            return `At ${time}, had ${entry.foodName} (${entry.grams}g) = ${entry.calories} kcal, ${entry.carbs}g carbs, ${entry.protein}g protein, ${entry.fat}g fat, ${entry.sugar}g sugar.`;
          })
          .join("\n")
      : "No recent nutrition data.";

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
          .join("\n")
      : "No recent exercise data.";

    // 🧠 Add sugar recommendation logic
    const isMale = user.sex.toLowerCase() === "male";
    const weightKg = user.weight;
    const heightCm = user.height;
    const age = user.age;
    const activityFactor =
      user.activityLevel === "high" ? 1.7 : user.activityLevel === "medium" ? 1.5 : 1.2;

    const bmr = isMale
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    const tdee = Math.round(bmr * activityFactor);
    const maxSugarsPerDay = Math.round((tdee * 0.1) / 4); // 10% of calories as sugar

    const today = new Date().toISOString().split("T")[0];
    const sugarToday = nutritionData
      .filter((entry) => entry.date.toISOString().split("T")[0] === today)
      .reduce((sum, entry) => sum + (entry.sugar || 0), 0);

    const sugarInsight = `
Estimated daily sugar limit: ${maxSugarsPerDay}g (based on TDEE of ${tdee} kcal)
Sugar consumed today: ${sugarToday.toFixed(2)}g
Remaining allowance: ${(maxSugarsPerDay - sugarToday).toFixed(2)}g
`;

    const hour = new Date().getHours();
    const dayTime = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "night";

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

    const prompt = `
It is currently ${dayTime}.
User profile:
${profileSummary}

Estimated dietary needs:
${sugarInsight}

Weekly glucose averages:
${weeklyStats}

Recent glucose readings:
${recentGlucose}

Recent meals and nutrition:
${nutritionSummary}

Recent exercise activity:
${exerciseSummary}

User's question: ${message}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a highly knowledgeable and supportive diabetes assistant. You use user profile information, BMR-based dietary estimation, and recent logs to provide medically-informed insights. If the user asks about how much more they can eat (like sugar), use their estimated TDEE to calculate safe allowances. Be realistic, empathetic, and data-driven.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiMessage = response.choices[0].message?.content || "No response.";

    // Save chat history with support for chatId threads
    if (chatId) {
      await Chat.findByIdAndUpdate(chatId, {
        $push: {
          messages: [
            { role: "user", content: message },
            { role: "assistant", content: aiMessage },
          ],
        },
      });
    } else {
      const newChat = await Chat.create({
        userId: user._id,
        title: message.slice(0, 40),
        messages: [
          { role: "user", content: message },
          { role: "assistant", content: aiMessage },
        ],
      });
      return NextResponse.json({ reply: aiMessage, chatId: newChat._id });
    }

    return NextResponse.json({ reply: aiMessage, chatId });
  } catch (error) {
    console.error("Chatbot API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
