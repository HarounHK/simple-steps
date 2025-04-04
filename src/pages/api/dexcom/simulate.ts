import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/authOptions";
import { connectMongoDB } from "../../../app/lib/mongodb";
import mongoose from "mongoose";
import Glucose from "../../../app/models/glucose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // Checking Dexcom token from cookies
  const dexcomToken = req.cookies.dexcom_token;
  if (!dexcomToken) {
    return res.status(401).json({ error: "Not authenticated (missing Dexcom token)" });
  }

  // Getting session
  // @ts-expect-error ignore
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "No user email in session" });
  }

  await connectMongoDB();

  // Finding user by session email
  const userDoc = await mongoose.connection
    .collection("users")
    .findOne({ email: session.user.email });

  if (!userDoc) {
    return res.status(404).json({ error: "User not found" });
  }

  // Checking if user is in Dexcomtracking mode
  if (userDoc.trackingMode !== "dexcom") {
    return res.status(200).json({ message: "User trackingMode is not dexcom." });
  }

  // Generating random glucose value
  const randomValue = Math.floor(Math.random() * (180 - 80 + 1)) + 80;

  const now = new Date();

  // Creating new reading
  const readingData = {
    userId: userDoc._id,
    glucoseLevel: randomValue,
    timeOfMeasurement: now,
    mealContext: "Before Meal",
    notes: "Simulated CGM reading",
    source: "Dexcom",
    trend: "Unknown",
  };

  const newGlucose = new Glucose(readingData);
  await newGlucose.save();

  await mongoose.connection
    .collection("users")
    .updateOne({ _id: userDoc._id }, { $set: { lastSimulatedAt: now } });

  return res.status(200).json({message: "Simulated Dexcom reading inserted",data: readingData,});
}