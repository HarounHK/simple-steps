import axios from 'axios';

const FATSECRET_URL = 'https://platform.fatsecret.com/rest/server.api';
const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

let accessToken = '';

// Fetch token only if it's not already set
async function fetchToken() {
  if (accessToken) return;

  const url = 'https://oauth.fatsecret.com/connect/token';
  
  try {
    const response = await axios.post(
      url,
      'grant_type=client_credentials&scope=basic',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    accessToken = response.data.access_token; // Store the token for future use
  } catch (error) {
    console.error(`Failed to get token: ${(error as Error).message}`);
    return;
  }
}

// Make a GET request to the FatSecret API
async function getFatSecretData(params: Record<string, string | number>) {
  if (!accessToken) await fetchToken();

  try {
    const response = await axios.get(FATSECRET_URL, {
      params: {
        ...params,
        format: 'json', 
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`FatSecret API call failed: ${(error as Error).message}`);
    return;
  }
}

export { fetchToken, getFatSecretData };