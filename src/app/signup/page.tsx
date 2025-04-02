"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ImagesSlider } from "@/components/ImagesSlider";

export default function SignupPage() {

  // Retrieves authenticated session 
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Defines the structure of DB entry
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [diabetesType, setDiabetesType] = useState("");
  const [targetWeight, setTargetWeight] = useState(0);
  const [activityLevel, setActivityLevel] = useState("Not Very");
  const [trackingMode, setTrackingMode] = useState("manual");

  // Holds error messages
  const [error, setError] = useState("");

  // Redirects authenticated users away from signup
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/home");
    }
  }, [status, router]);

  // Handles first page of the signup form
  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }

    try {
      // POST request to check if user already exists
      const userExistsResponse = await fetch("/api/userExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { user } = await userExistsResponse.json();
      if (user) {
        setError("User already exists.");
        return;
      }

      setStep(2);
    } catch (error){
      console.log("Error during registration: ", error);
    }
  };

  // Handles form submission for new signup
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!sex || !diabetesType) {
      setError("Please fill in all of the required fields.");
      return;
    }

    try {
      // sens post request to signup
      const signupResponse = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          sex,
          age,
          height,
          weight,
          diabetesType,
          targetWeight,
          activityLevel,
        }),
      });

      if (signupResponse.ok) {
        router.push("/login");
      } else {
        console.log("User Registration Failed")
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center text-white">
      <ImagesSlider
        images={["/images/image1.jpg", "/images/image2.jpg", "/images/image3.jpg"]}
        className="absolute inset-0 w-full h-full object-cover z-0">
        <> </>
      </ImagesSlider>
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
        bg-black/70 border border-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md 
        z-10 backdrop-blur-lg">
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-center text-white mb-6">
              Sign Up (Step 1)
            </h1>
            <form onSubmit={handleNext} className="space-y-4">
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:outline-none focus:ring focus:ring-[#1F1A5E]"
                type="text"
                placeholder="Enter your name"/>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:outline-none focus:ring focus:ring-[#1F1A5E]"
                type="email"
                placeholder="Enter your email"/>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded focus:outline-none focus:ring focus:ring-[#1F1A5E]"
                type="password"
                placeholder="Enter your password"/>
              <button
                className="w-full text-white py-2 rounded transition"
                style={{ backgroundColor: "#1F1A5E" }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#B580E4")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}>
                Next
              </button>
              {error && <div className="bg-red-500 text-white p-2 rounded">{error}</div>}
              <Link
                className="text-sm text-center block text-gray-400 hover:text-white"
                href="/login"
              >
                Already have an account? <span className="underline">Sign In</span>
              </Link>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-3xl font-bold text-center text-white mb-6">
              Sign Up (Step 2)
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Sex</label>
              <select
                onChange={(e) => setSex(e.target.value)}
                value={sex}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-2">
                <option value="">Select Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not</option>
              </select>
              <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
              <input
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                value={age}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-2"
                type="number"
                placeholder="60"/>
              <label className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
              <input
                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                value={height}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-2"
                type="number"
                placeholder="170"/>
              <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
              <input
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                value={weight}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-2"
                type="number"
                placeholder="70"/>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Diabetes Type
              </label>
              <select
                onChange={(e) => setDiabetesType(e.target.value)}
                value={diabetesType}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-2">
                <option value="">Select Diabetes Type</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
                <option value="gestational">Gestational</option>
                <option value="other">Other / Not Sure</option>
              </select>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Target Weight (kg)
              </label>
              <input
                onChange={(e) => setTargetWeight(parseInt(e.target.value) || 0)}
                value={targetWeight}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-2"
                type="number"
                placeholder="65"/>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Activity Level
              </label>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Glucose Tracking Mode
              </label>
              <select
                onChange={(e) => setTrackingMode(e.target.value)}
                value={trackingMode}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-4">
                <option value="manual">Manual Entry</option>
                <option value="dexcom">Dexcom Device</option>
              </select>
              <select
                onChange={(e) => setActivityLevel(e.target.value)}
                value={activityLevel}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded mb-4">
                <option value="">Select Activity Level</option>
                <option value="Not Very">Not Very</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Active">Active</option>
                <option value="Very Active">Very Active</option>
              </select>
              <button
                className="w-full text-white py-2 rounded transition"
                style={{ backgroundColor: "#1F1A5E" }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#B580E4")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}>
                Create Account
              </button>
              {error && <div className="bg-red-500 text-white p-2 rounded">{error}</div>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
