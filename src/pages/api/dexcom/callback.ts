import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query; // Extracting authorization code and state from the query parameters

  if (!code || !state) {
    console.error("Invalid state or missing authorization code.");
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

    // Storing tokens in HTTP only cookies for continous authentication (no need to log in everytime server restarts)
    res.setHeader('Set-Cookie', [
      `dexcom_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires_in}`,
      `dexcom_refresh_token=${refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
    ]);

    // Redirecting user to the data retrieval endpoint after successful authentication
    res.writeHead(302, { Location: "/home" });
    return res.end();
  } catch (error: unknown) { 
    const axiosError = error as AxiosError;
    return res.status(500).json({ error: 'Failed to obtain access token', details: axiosError.response?.data || axiosError.message });
  }
}