import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Generating a random state token to prevent CSRF attacks
  const state = crypto.randomBytes(8).toString('hex');

  // Dexcom OAuth authorization URl
  // const authUrl = `https://api.dexcom.com/v2/oauth2/login?client_id=${process.env.DEXCOM_CLIENT_ID}&redirect_uri=${process.env.DEXCOM_REDIRECT_URI}&response_type=code&scope=offline_access&state=${state}`;
  const authUrl = `https://sandbox-api.dexcom.com/v2/oauth2/login?client_id=${process.env.DEXCOM_CLIENT_ID}&redirect_uri=${process.env.DEXCOM_REDIRECT_URI}&response_type=code&scope=offline_access&state=${state}`;

  res.redirect(authUrl); // Redirecting user to Dexcom authentication
}