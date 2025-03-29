import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import nutrition from "../../../../models/nutrition";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

// Handles the DELETE request to remove a nutrition entry
export async function DELETE(request, { params }) {
    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        // Ensures the userID is available 
        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        // Extracting the nutrition ID from params
        const { id } = params;
        if (!id) {
            return NextResponse.json({ message: "Missing nutrition ID" }, { status: 400 });
        }

        // Deletes the existing nutrition entry in the DB
        const deletedEntry = await nutrition.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        // Response if the nutrition entry isn’t found
        if (!deletedEntry) {
            return NextResponse.json({ message: "Nutrition entry not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Nutrition entry deleted successfully", deletedEntry }, { status: 200 });
    
    } catch {
        return NextResponse.json({ message: "Failed to delete nutrition entry" }, { status: 500 });
    }
}

// Handles the PUT request to update a nutrition entry
export async function PUT(request, { params }) {
    try {
        await connectMongoDB();

        // Retrieves the session
        const session = await getServerSession({ req: request, ...authOptions });
        if (!session || !session.user) {
            return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
        }

        // Ensures the userID is available 
        if (!session.user.id) {
            return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
        }

        // Extracting the nutrition ID from params
        const { id } = params;
        if (!id) {
            return NextResponse.json({ message: "Missing nutrition ID" }, { status: 400 });
        }

        // Parses the JSON data from request body
        const { mealType, foodName, grams, calories, protein, carbs, fat, sugar } = await request.json();

        // Validates that all required fields are not empty before pushing to the DB
        if (!mealType || !foodName || !grams || !calories) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Updates the existing nutrition entry in the DB
        const updatedEntry = await nutrition.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { mealType, foodName, grams, calories, protein, carbs, fat, sugar },
            { new: true }
        );

        // Response if the nutrition entry isn’t found
        if (!updatedEntry) {
            return NextResponse.json({ message: "Nutrition entry not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Nutrition entry updated successfully", updatedEntry }, { status: 200 });

    } catch {
        return NextResponse.json({ message: "Failed to update nutrition entry" }, { status: 500 });
    }
}
