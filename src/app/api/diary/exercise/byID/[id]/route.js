import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Exercise from "../../../../../models/exercise";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";

// Handles the DELETE request to remove an exercise entry
export async function DELETE(request, context) {
  try {
    // Connect to DB
    await connectMongoDB();

    // Get session
    const session = await getServerSession({ req: request, ...authOptions });
    if (!session?.user) {
      return NextResponse.json({ message: "User is not authorized" }, { status: 401 });
    }
    if (!session.user.id) {
      return NextResponse.json({ message: "User ID is missing, Can't identify user" }, { status: 500 });
    }

    // Extract the exercise ID from params
    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ message: "Missing exercise ID" }, { status: 400 });
    }

    // Delete the exercise entry
    const deletedEntry = await Exercise.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedEntry) {
      return NextResponse.json({ message: "Exercise entry not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Exercise entry deleted successfully", deletedEntry },
      { status: 200 }
    );

  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(
      { message: "Failed to delete exercise entry" },
      { status: 500 }
    );
  }
}

// Handles the PUT request to update an exercise entry
export async function PUT(request, context) {
  try {
    await connectMongoDB();

    const session = await getServerSession({ req: request, ...authOptions });
    if (!session?.user) {
      return NextResponse.json({ message: "User not authorized" }, { status: 401 });
    }

    // This is how we get the :id param from the URL
    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ message: "Missing exercise ID" }, { status: 400 });
    }

    // read JSON body
    const body = await request.json();

    const { activityName, caloriesBurned, time } = body;

    // if (!mealType || !activityName || !caloriesBurned) {
    if (!activityName || !caloriesBurned || !time) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const updatedEntry = await Exercise.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { activityName, caloriesBurned, time },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json({ message: "Exercise entry not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Exercise entry updated successfully", updatedEntry },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "Failed to update exercise entry" }, { status: 500 });
  }
}
