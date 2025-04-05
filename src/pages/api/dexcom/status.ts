import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/authOptions";
import { connectMongoDB } from "../../../app/lib/mongodb";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-expect-error ignore
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(200).json({ authorized: false });
  }

  // Connecting to DB and finding user doc
  await connectMongoDB();
  const userDoc = await mongoose.connection
    .collection("users")
    .findOne({ email: session.user.email });

  if (!userDoc) {
    return res.status(200).json({ authorized: false });
  }

  // Checking if user is in Dexcom mode and has token
  if (
    userDoc.trackingMode === "dexcom" &&
    userDoc.dexcomAccessToken &&
    userDoc.dexcomRefreshToken
  ) {
    return res.status(200).json({ authorized: true });
  }

  return res.status(200).json({ authorized: false });
}
