"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function HomePage() {
  // Retrieves the authenticatied session
  const { data: session, status } = useSession();
  const router = useRouter();

  // variables for handling form input
  const [glucoseLevel, setGlucoseLevel] = useState("");
  const [timeOfMeasurement, setTimeOfMeasurement] = useState("");
  const [mealContext, setMealContext] = useState("Before Meal");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  // Redirects to login page if the user isnt authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (!session) {
    return;
  }

  // Handles form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents the page from reloading

    const glucoseData = {
      glucoseLevel: parseInt(glucoseLevel, 10),
      timeOfMeasurement,
      mealContext,
      notes,
    };

    // Sends POST request to glucose api to save the data 
    try {
      const response = await fetch("/api/glucose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(glucoseData),
      });

      const data = await response.json();

      // If data goes through resets the form fields
      if (response.ok) {
        setMessage("Glucose reading saved successfully");
        setGlucoseLevel("");
        setTimeOfMeasurement("");
        setMealContext("Before Meal");
        setNotes("");
      } else {
        setMessage(data.message || "Failed to save the glucose reading");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#D7AAFA] text-white">
      <h1 className="text-4xl font-bold text-[#1F1A5E] mb-4">
        Welcome, {session.user?.name}!
      </h1>
      <p className="text-lg text-gray-900">Homepage.</p>

      {/* Temporary Glucose Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Add Glucose Reading
        </h2>

        {/* Displays the  success or error messages */}
        {message && <p className="text-center text-sm text-gray-800">{message}</p>}

        {/* Form*/}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="number"
            placeholder="Glucose Level (mg/dL)"
            value={glucoseLevel}
            onChange={(e) => setGlucoseLevel(e.target.value)}
            required
            className="border p-2 rounded-md text-black"
          />

          <input
            type="datetime-local"
            value={timeOfMeasurement}
            onChange={(e) => setTimeOfMeasurement(e.target.value)}
            required
            className="border p-2 rounded-md text-black"
          />

          <select
            value={mealContext}
            onChange={(e) => setMealContext(e.target.value)}
            className="border p-2 rounded-md text-black"
          >
            <option value="Before Meal">Before Meal</option>
            <option value="After Meal">After Meal</option>
            <option value="Fasting">Fasting</option>
          </select>

          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded-md text-black"
          ></textarea>

          <button
            type="submit"
            className="bg-[#1F1A5E] text-white py-2 px-4 rounded-md hover:bg-[#15114A]"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}