import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import User from "../../models/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const {
      name,
      email,
      password,
      sex,
      age,
      height,
      weight,
      diabetesType,
      targetWeight,
      activityLevel,
      trackingMode,
    } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 5);

    await connectMongoDB();

    await User.create({
      name,
      email,
      password: hashedPassword,
      sex,
      age,
      height,
      weight,
      diabetesType,
      targetWeight,
      activityLevel,
      trackingMode,
    });

    return NextResponse.json({ message: "User registered successfully" },{ status: 201 });
    
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json({ message: "An error occurred. Failed to register user" },{ status: 500 });
  }
}
