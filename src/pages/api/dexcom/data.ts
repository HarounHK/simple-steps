import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/authOptions";
import { connectMongoDB } from "../../../app/lib/mongodb";
import mongoose from "mongoose";

// Formating date for Dexcom
function formatDateForDexcom(date: Date): string {
  return date.toISOString().split('.')[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // @ts-expect-error ignore
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized. Please sign in." });
  }

  await connectMongoDB();

  const user = await mongoose.connection
    .collection("users")
    .findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  let token = user.dexcomAccessToken;
  const refreshToken = user.dexcomRefreshToken;
  const tokenExpiry = new Date(user.dexcomTokenExpiry);

  // Refreshing token if expired
  if (!token || new Date() > tokenExpiry) {
    try {
      const refreshResponse = await axios.post('https://sandbox-api.dexcom.com/v2/oauth2/token',
        new URLSearchParams({
          client_id: process.env.DEXCOM_CLIENT_ID!,
          client_secret: process.env.DEXCOM_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const { access_token, refresh_token: newRefreshToken, expires_in } = refreshResponse.data;

      token = access_token;

      // Save updated tokens in DB and cookies
      const expiryDate = new Date(Date.now() + expires_in * 1000);

      await mongoose.connection.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            dexcomAccessToken: access_token,
            dexcomRefreshToken: newRefreshToken,
            dexcomTokenExpiry: expiryDate,
          }
        }
      );

      res.setHeader('Set-Cookie', [
        `dexcom_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires_in}`,
        `dexcom_refresh_token=${newRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
      ]);
    } catch (err) {
      console.log("refresh token error:", err);
      return res.status(401).json({ error: "Dexcom session expired. Please reauthorize." });
    }
  }

  try {
    const now = new Date();
    const startDate = formatDateForDexcom(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)); // previous7 days
    const endDate = formatDateForDexcom(now); 

    // const response = await axios.get(`https://api.dexcom.com/v2/users/self/egvs?startDate=${startDate}&endDate=${endDate}`, {
    const response = await axios.get(`https://sandbox-api.dexcom.com/v2/users/self/egvs?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.log("eeror:", error);
    return res.status(500).json({ error: "Failed to fetch glucose data" });
  }
}
