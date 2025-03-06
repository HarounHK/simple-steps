import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb"; 
import Glucose from "../../models/glucose";
import { getSession } from "next-auth/react";

export async function POST(request) {
    try {
        console.log("Environment Variables at API Route:", process.env); 
        
        // Parseing incoming data from the request
        const { glucoseLevel, timeOfMeasurement, mealContext, notes } = await request.json();
        
        // Ensuring db connection
        await connectMongoDB();

        // Getting loggedin user session
        const session = await getSession({ req: request });

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Validating required fields
        if (!glucoseLevel || !timeOfMeasurement || !mealContext) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Creating new glucose entry (Manual users)
        await Glucose.create({
            userId: session.user.id, 
            glucoseLevel,
            timeOfMeasurement: new Date(timeOfMeasurement),
            mealContext,
            notes,
            source: "Manual",
            trend: "Unknown"  
        });

        return NextResponse.json({ message: "Glucose reading saved successfully" }, { status: 201 });

    } catch (error) {
        console.error("Error saving glucose reading:", error);
        return NextResponse.json({ message:"An error occurred. Failed to save glucose reading"}, { status: 500 });
    }
}