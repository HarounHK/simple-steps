"use client";

import { ImagesSlider } from "@/components/ImagesSlider";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home"); // Redirecting logged-in users to home page
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (session) return null;

  return (
    <div className="relative w-full h-screen flex items-center justify-center text-white">
      <ImagesSlider images={["/images/image1.jpg", "/images/image2.jpg", "/images/image3.jpg"]} className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <h1 className="text-5xl font-extrabold mb-4 text-white">
          Welcome to Simple Steps <br />
          Diabetes and Health Management Platform
        </h1>
        <Link
          href="/signup"
          className="mt-4 text-white px-6 py-3 rounded-full text-lg font-semibold transition duration-300"
          style={{ backgroundColor: "#1F1A5E" }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#D7AAFA")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}
        >
          Join now →
        </Link>
      </div>
    </div>
  );
}