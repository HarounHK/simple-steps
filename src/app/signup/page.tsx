"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImagesSlider } from "@/components/ImagesSlider";
import Link from "next/link";

export default function SignupPage() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home"); // Redirect logged-in users away from signup
    }
  }, [status, router]);

  if (status === "authenticated") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }

    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();
      if (user) {
        setError("User already exists.");
        return;
      }

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        console.log("User registration failed.");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center text-white">
      <ImagesSlider images={["/images/image1.jpg", "/images/image2.jpg", "/images/image3.jpg"]} className="absolute inset-0 w-full h-full object-cover z-0">
        <> </>
      </ImagesSlider>
      
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        bg-black/70 border border-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md 
        z-10 backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:outline-none focus:ring focus:ring-[#1F1A5E]"
            type="text"
            placeholder="Enter your name"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:outline-none focus:ring focus:ring-[#1F1A5E]"
            type="email"
            placeholder="Enter your email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:outline-none focus:ring focus:ring-[#1F1A5E]"
            type="password"
            placeholder="Enter your password"
          />
          <button
            className="w-full text-white py-2 rounded transition"
            style={{ backgroundColor: "#1F1A5E" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#B580E4")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}
          >
            Sign Up
          </button>
          {error && <div className="bg-red-500 text-white p-2 rounded">{error}</div>}
          <Link className="text-sm text-center block text-gray-400 hover:text-white" href="/login">
            Already have an account? <span className="underline">Sign In</span>
          </Link>
        </form>
      </div>
    </div>
  );
}