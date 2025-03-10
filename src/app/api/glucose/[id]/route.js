import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Glucose from "../../../models/glucose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Handles the PUT request to edit glucose readings
export async function PUT(request, { params }) {
    try {
        await connectMongoDB();

        const session = await getServerSession({ req: request, ...authOptions });

        // Response if session isn't found
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        // Ensures the userID is available 
        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        //Extracting thw glucose ID from params
        const { id } = params;
        if (!id) {
            return NextResponse.json({ message: "Missing glucose ID" }, { status: 400 });
        }

        const { glucoseLevel, timeOfMeasurement, mealContext, notes } = await request.json();

        // Validates that all required fields are not empty
        if (!glucoseLevel || !timeOfMeasurement || !mealContext) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Updates the existing glucose entry in the DB
        const updatedGlucose = await Glucose.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            {
                glucoseLevel,
                timeOfMeasurement: new Date(timeOfMeasurement),
                mealContext,
                notes,
            },
            { new: true }
        );

        // Response if the glucose entry isnot found
        if (!updatedGlucose) {
            return NextResponse.json({ message: "Glucose reading not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Glucose reading updated successfully", updatedGlucose }, { status: 200 });
    } catch {
        return NextResponse.json({ message: "Failed to update glucose reading" }, { status: 500 });
    }
}
