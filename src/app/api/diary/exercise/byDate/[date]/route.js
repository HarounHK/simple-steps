import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Exercise from "../../../../../models/exercise";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";

// Handles the GET request to fetch exercise entries for a specific date
export async function GET(request, context) {

    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });

        if (!session?.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        // Extract the 'date' param
        const { date } = context.params;

        if (!date) {
            return NextResponse.json({ message: "Missing date parameter" }, { status: 400 });
        }

        // Creates date range for specified day
        const entryDate = new Date(date);

        const startOfDay = new Date(entryDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(entryDate.setHours(23, 59, 59, 999));

        // Query for all entries matching the date range
        const entries = await Exercise.find({
            userId: session.user.id,
            date: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ createdAt: -1 });

        return NextResponse.json({ entries }, { status: 200 });

    } catch (error) {
        console.log("error", error);
        return NextResponse.json({ message: "Failed to fetch exercise entries" }, { status: 500 });
    }
}

// Handles the POST request to create a new exercise entry
export async function POST(request, context) {

    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });

        if (!session?.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        // Extract the 'date' param from context
        const { date } = context.params;

        if (!date) {
            return NextResponse.json({ message: "Missing date parameter" }, { status: 400 });
        }

        const entryDate = new Date(date);

        // Parse the JSON data from request body
        const body = await request.json();

        const { activityName, caloriesBurned, time } = body;

        if (!activityName || !caloriesBurned || !time) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Create & save the new exercise entry in the DB
        const newEntry = await Exercise.create({
            userId: session.user.id,
            date: entryDate,
            activityName,
            caloriesBurned,
            time, 
        });

        return NextResponse.json(
            { message: "Exercise entry saved successfully", newEntry },
            { status: 201 }
        );

    } catch (error) {
        console.log("error:", error);
        return NextResponse.json({ message: "Failed to save exercise entry" }, { status: 500 });
    }
}
