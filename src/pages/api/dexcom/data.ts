import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

//Formating  date to Dexcoms required date format: YYYY-MM-DDTHH:mm:ss

function formatDateForDexcom(date: Date): string {
  return date.toISOString().split('.')[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let token = req.cookies.dexcom_token;
  let refreshToken = req.cookies.dexcom_refresh_token;

  console.log("Access Token:", token ? token.substring(0, 15) : "");
  console.log("Refresh Token:", refreshToken ? refreshToken.substring(0, 15) : "");

  // Refreshing token if access token is missing/outdated
  if (!token && refreshToken) {
    try {
      console.log("Refreshing access token...");

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

      console.log("Token refresh successful.");
      token = access_token;

      // Storing updated tokens in cookies
      res.setHeader('Set-Cookie', [
        `dexcom_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires_in}`,
        `dexcom_refresh_token=${newRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
      ]);

    } catch (refreshError: any) {
      console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
  }

  // Rejecting request if no valid token is available
  if (!token) {
    return res.status(401).json({ error: "Your account is unauthorized. Plese lg in to access data." });
  }

  try {
    console.log("Fetching glucose data...");

    const now = new Date();
    const startDate = formatDateForDexcom(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)); // previous7 days
    const endDate = formatDateForDexcom(now); 

    const response = await axios.get(`https://sandbox-api.dexcom.com/v2/users/self/egvs?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Glucose data retrieved successfully.");
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Dexcom data fetch error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch glucose data", details: error.response?.data || error.message });
  }
}