import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

//Formating date to Dexcoms required date format: YYYY-MM-DDTHH:mm:ss
function formatDateForDexcom(date: Date): string {
  return date.toISOString().split('.')[0];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let token = req.cookies.dexcom_token;
  const refreshToken = req.cookies.dexcom_refresh_token; 

  // Refreshing token if access token is missing/outdated
  if (!token && refreshToken) {
    try {
      console.log("Refreshing access token...");

      // const refreshResponse = await axios.post('https://api.dexcom.com/v2/oauth2/token',
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

      // Storing updated tokens in cookies
      res.setHeader('Set-Cookie', [
        `dexcom_token=${access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expires_in}`,
        `dexcom_refresh_token=${newRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`
      ]);

    } catch (refreshError: unknown) { 
      const axiosError = refreshError as AxiosError;
      console.error("Token refresh failed:", axiosError.response?.data || axiosError.message);
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
  }

  // Rejecting request if no valid token is available
  if (!token) {
    return res.status(401).json({ error: "Your account is unauthorized. Please log in to access data." });
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
  } catch (error: unknown) { 
    const axiosError = error as AxiosError;
    console.error("Dexcom data fetch error:", axiosError.response?.data || axiosError.message);
    return res.status(500).json({ error: "Failed to fetch glucose data", details: axiosError.response?.data || axiosError.message });
  }
}
