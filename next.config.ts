import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_URL:
      process.env.VERCEL_ENV === "development"
        ? "http://localhost:3000"
        : process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_URL}`
        : "https://simple-steps-i3gv79srg-haroun-kassouris-projects.vercel.app", 
  },
};

export default nextConfig;
