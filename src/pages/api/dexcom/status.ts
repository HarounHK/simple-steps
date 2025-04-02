import type { NextApiRequest, NextApiResponse } from "next";

// Checks if user is authorisez
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.dexcom_token;

  if (token) {
    return res.status(200).json({ authorized: true });
  } else {
    return res.status(200).json({ authorized: false });
  }
}
