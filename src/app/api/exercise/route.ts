// src/app/exercise/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.EXERCISE_API_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activity = searchParams.get("activity");
    const userWeight = searchParams.get("weight") || "70"; // default to 70kg if not provided

    if (!activity) {
      return NextResponse.json({ error: "No exercise specified" }, { status: 400 });
    }

    const apiUrl = `https://api.api-ninjas.com/v1/caloriesburned?activity=${encodeURIComponent(
      activity
    )}&weight=${userWeight}`;

    const res = await fetch(apiUrl, {
      headers: { "X-Api-Key": API_KEY },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch exercise data" }, { status: 500 });
    }

    const data = await res.json();

    // data is already an array from API Ninjas, e.g. [{ name, calories_per_hour, etc. }]
    // In case you want only top 3 results (like in your nutrition search):
    const topResults = data.slice(0, 3);

    return NextResponse.json(topResults, { status: 200 });
  } catch (error) {
    console.log("error", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
