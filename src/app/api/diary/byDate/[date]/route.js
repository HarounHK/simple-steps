import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import nutrition from "../../../../models/nutrition";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

// Handles the GET request to fetch nutrition entries for a specific date
export async function GET(request, { params }) {
    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        // Extracting the date from params
        const { date } = params;
        if (!date) {
            return NextResponse.json({ message: "Missing date parameter" }, { status: 400 });
        }

        // Creates date range for specified day
        const entryDate = new Date(date);
        const startOfDay = new Date(entryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(entryDate.setHours(23, 59, 59, 999));        

        // Query for all entries matching the date range
        const entries = await nutrition.find({
            userId: session.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ createdAt: -1 });

        return NextResponse.json({ entries }, { status: 200 });

    } catch {
        return NextResponse.json({ message: "Failed to fetch diary entries" }, { status: 500 });
    }
}

// Handles the POST request to create a new nutrition entry
export async function POST(request, { params }) {
    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        // Extracting the date from params
        const { date } = params;
        if (!date) {
            return NextResponse.json({ message: "Missing date parameter" }, { status: 400 });
        }

        const entryDate = new Date(date);

        // Parses the JSON data from request body
        const { mealType, foodName, grams, calories, protein, carbs, fat, sugar } = await request.json();

        // Validates that all required fields are not empty before saving to the DB
        if (!mealType || !foodName || !grams || !calories) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Create and save the new nutrition entry in the DB
        const newEntry = await nutrition.create({
            userId: session.user.id,
            date: entryDate,
            mealType,
            foodName,
            grams,
            calories,
            protein,
            carbs,
            fat,
            sugar,
        });

        return NextResponse.json({ message: "Nutrition entry saved successfully", newEntry }, { status: 201 });

    } catch {
        return NextResponse.json({ message: "Failed to save nutrition entry" }, { status: 500 });
    }
}
