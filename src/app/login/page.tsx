"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImagesSlider } from "@/components/ImagesSlider";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    } else if (status === "unauthenticated") {
      router.replace("/login"); 
    }
  }, [status, router]);  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid Credentials");
        return;
      }
      router.replace("/home");
    } catch (error) {
      console.log(error);
    }
  };

  if (status === "authenticated") return null;

  const images = ["/images/image1.jpg", "/images/image2.jpg", "/images/image3.jpg"];

  return (
    <div className="relative w-full h-screen flex items-center justify-center text-white">
      <ImagesSlider images={images} className="absolute inset-0 w-full h-full object-cover z-0">
        <> </>
      </ImagesSlider>
  
      <div className="absolute inset-0 bg-black/60 z-0"></div>
  
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        bg-black/70 border border-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md 
        z-10 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded 
              focus:outline-none focus:ring focus:ring-[#1F1A5E]"
            type="email"
            placeholder="Enter your email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded 
              focus:outline-none focus:ring focus:ring-[#1F1A5E]"
            type="password"
            placeholder="Enter your password"
          />
          <button
            className="w-full text-white py-2 rounded transition"
            style={{ backgroundColor: "#1F1A5E" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#D7AAFA")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}
          >
            Sign In
          </button>
          {error && <div className="bg-red-500 text-white p-2 rounded">{error}</div>}
          <Link className="text-sm text-center block text-gray-400 hover:text-white" href="/signup">
            Dont have an account? <span className="underline">Sign up</span>
          </Link>
        </form>
      </div>
    </div>
  );  
}