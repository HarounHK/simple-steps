import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../app/api/auth/[...nextauth]/authOptions";
import { connectMongoDB } from "../../../app/lib/mongodb";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query; // Extracting authorization code and state from the query parameters

  if (!code || !state) {
    return res.status(400).json({ error: 'Invalid state parameter or missing authorization code' });
  }

  try {
    // Requesting access token from Dexcom using the authorization code
    // const tokenResponse = await axios.post('https://api.dexcom.com/v2/oauth2/token',
    const tokenResponse = await axios.post('https://sandbox-api.dexcom.com/v2/oauth2/token', 
      new URLSearchParams({
        client_id: process.env.DEXCOM_CLIENT_ID!,
        client_secret: process.env.DEXCOM_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DEXCOM_REDIRECT_URI!
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Storing tokens in HTTP only cookies for continuous authentication
    res.setHeader('Set-Cookie', [
      `dexcom_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires_in}`,
      `dexcom_refresh_token=${refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    ]);

    // Persisting Dexcom tokens to user profile in MongoDB
    // @ts-expect-error ignore
    const session = await getServerSession(req, res, authOptions);
    if (session?.user?.email) {
      await connectMongoDB();

      const expiryTime = new Date(Date.now() + expires_in * 1000); // Convert to Date

      await mongoose.connection.collection("users").updateOne(
        { email: session.user.email },
        {
          $set: {
            dexcomAccessToken: access_token,
            dexcomRefreshToken: refresh_token,
            dexcomTokenExpiry: expiryTime
          }
        }
      );
    }

    // Redirecting user to the data retrieval endpoint after successful authentication
    res.writeHead(302, { Location: "/home" });
    return res.end();
  } catch (error) { 
    console.log("error:", error);
    return res.status(500).json({ error: 'Failed to obtain access token' });
  }
}
