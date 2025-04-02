import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/authOptions";
import { connectMongoDB } from "../../../app/lib/mongodb";
import mongoose from "mongoose";
import Glucose from "../../../app/models/glucose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Starting Dexcom simulation...");

    // @ts-expect-error ignore 
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    console.log("No user in session, stopping.");
    return res.status(401).json({ error: "Not authenticated" });
  }

  await connectMongoDB();
  console.log("Connected to MongoDB");

  // Checks if user is using dexcom modew
  const userDoc = await mongoose.connection
    .collection("users")
    .findOne({ email: session.user.email });

  if (!userDoc) {
    console.log("User not found for:", session.user.email);
    return res.status(404).json({ error: "User not found" });
  }

  if (userDoc.trackingMode !== "dexcom") {
    console.log("Not a Dexcom user.");
    return res.status(200).json({ message: "User trackingMode is not dexcom." });
  }

  // Generating random glucose reading
  const randomValue = Math.floor(Math.random() * (180 - 80 + 1)) + 80; 

  // @ts-expect-error ignore
  const userId = session.user.id; 

  const readingData = {
    userId,                      
    glucoseLevel: randomValue,
    timeOfMeasurement: new Date(),
    mealContext: "Before Meal",  
    notes: "Simulated CGM reading",
    source: "Dexcom",           
    trend: "Unknown",           
  };

  // Inserting new glucose reading into DB
  const newGlucose = new Glucose(readingData);
  await newGlucose.save();

  return res.status(200).json({
    message: "Simulated Dexcom reading inserted",
    data: readingData,
  });
}