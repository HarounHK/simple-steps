import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import Glucose from "../../models/glucose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Handles the POST request to save a new glucose reading
export async function POST(request) {
    try {
        const session = await getServerSession({ req: request, ...authOptions });

        // Response if session isnt found
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        // Ensures the userID is available (User needs to be recognised for their data to be pushed into DB)
        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Cant identify user" }, { status: 500 });
        }

        // Parsing theJSON data from request body
        const { glucoseLevel, timeOfMeasurement, mealContext, notes } = await request.json();

        await connectMongoDB();

        // Validates that all fielda required fields are not empty before pushind to the DB
        if (!glucoseLevel || !timeOfMeasurement || !mealContext) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Pushing a new glucose entry into the DB
        const newGlucose = new Glucose({
            userId: session.user.id,
            glucoseLevel,
            timeOfMeasurement: new Date(timeOfMeasurement), 
            mealContext,
            notes,
            source: "Manual", // This value is hardcoded if user enters glucose data maniually
            trend: "Unknown" 
        });

        // Saves the data to MongoDB
        await newGlucose.save();
        return NextResponse.json({ message: "Glucose reading saved successfully" }, { status: 201 });

    } catch {
        return NextResponse.json({ message: "Error, Faileed to save glucose reading" }, { status: 500 });
    }
}