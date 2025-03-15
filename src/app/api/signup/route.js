import { NextResponse } from "next/server";
import { connectMongoDB } from "../../lib/mongodb";
import User from "../../models/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    console.log("===== SERVER: Inside /api/signup POST =====");

    // 1) Parse body
    const body = await request.json();
    console.log("===== SERVER: Received signup body =====");
    console.log(body);  // <-- This shows EXACTLY what the client is sending

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
    } = body;

    // 2) Hash user password
    const hashedPassword = await bcrypt.hash(password, 5);

    // 3) Connect to MongoDB
    await connectMongoDB();
    console.log("===== SERVER: MongoDB connected, about to create user =====");

    // 4) Create the user with everything
    const newUser = await User.create({
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
    });

    console.log("===== SERVER: User created in DB =====");
    console.log(newUser); // This logs the new doc (including _id, etc.)

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("===== SERVER: Error during signup: =====", error);
    return NextResponse.json(
      { message: "An error occurred. Failed to register user" },
      { status: 501 }
    );
  }
}
