import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import User from "../../models/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// Handles the GET request to fetch Profile data
export async function GET(request) {
  try {
    await connectMongoDB();

    // Retrieves the session
    const session = await getServerSession({ req: request, ...authOptions });
    if (!session || !session.user) {
      return NextResponse.json({ message: "User logged in" }, { status: 401 });
    }

    // Retrieves the user ID from the session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ message: "User ID missing" }, { status: 500 });
    }

    // Finds user by ID
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Removes password and returns the other user fields
    const { password, ...safeUser } = user;
    void password;
    return NextResponse.json({ user: safeUser }, { status: 200 });

  } catch {
    return NextResponse.json({ message: "Failed to retrieve user profile" }, { status: 500 });
  }
}

// Handles the PUT request to edit profile details
export async function PUT(request) {
  try {
    await connectMongoDB();

    const session = await getServerSession({ req: request, ...authOptions });

    if (!session || !session.user) {
      return NextResponse.json({ message: "User Not logged in" }, { status: 401 });
    }

    // Ensures the userID is available
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ message: "User ID is missing, Cant identify user" }, { status: 500 });
    }

    // Parses the JSON data from request body
    const { sex, age, height, weight, diabetesType, targetWeight, activityLevel, trackingMode } = await request.json();

    // Updates the existing user entry in the DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        sex,
        age,
        height,
        weight,
        diabetesType,
        targetWeight,
        activityLevel,
        trackingMode,
      },
      { new: true }
    );

    // Response if the glucose entry isn't found
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser },{ status: 200 });
  
  } catch{
    return NextResponse.json({ message: "Failed to update user profile" },{ status: 500 });
  }
}