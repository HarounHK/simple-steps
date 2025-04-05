import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Clearing Dexcom cookies");

  res.setHeader("Set-Cookie", [
    `dexcom_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`,
    `dexcom_refresh_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  ]);

  return res.status(200).json({ message: "Dexcom cookies cleared" });
}
