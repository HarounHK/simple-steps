import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import Glucose from "../../models/glucose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// Handles the GET request to fetch glucose readings
export async function GET(request) {
    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        // Parses the query params for pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "5", 10);
        const skip = (page - 1) * limit;

        // Retrieves glucose readings only for the specific logged-in user sorted by latest 
        const readings = await Glucose.find({ userId: session.user.id })
            .sort({ timeOfMeasurement: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({ readings }, { status: 200 });

    } catch {
        return NextResponse.json({ message: "Error, Failed to fetch glucose readings" }, { status: 500 });
    }
}

// Handles the POST request to save a new glucose reading
export async function POST(request) {
    try {
        await connectMongoDB();

        const session = await getServerSession({ req: request, ...authOptions });
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Cant identify user" }, { status: 500 });
        }

        // Parses the JSON data from request body
        const { glucoseLevel, timeOfMeasurement, mealContext, notes } = await request.json();

        // Validates that all required fields are not empty before pushing to the DB
        if (!glucoseLevel || !timeOfMeasurement || !mealContext) {
            return NextResponse.json({ message: "Missing required input fields" }, { status: 400 });
        }

        // Pushing a new glucose entry into the DB
        const newGlucose = new Glucose({
            userId: session.user.id,
            glucoseLevel,
            timeOfMeasurement: new Date(timeOfMeasurement), 
            mealContext,
            notes,
            source: "Manual", // This value is hardcoded if user enters glucose data manually
            trend: "Unknown" 
        });

        // Saves the data to MongoDB
        await newGlucose.save();

        return NextResponse.json({ message: "Glucose reading saved successfully" }, { status: 201 });

    } catch {
        return NextResponse.json({ message: "Error, Failed to save glucose reading" }, { status: 500 });
    }
}