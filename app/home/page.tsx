"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

// Defines the structure of a glucose entry retrieved from DB
type GlucoseEntry = {
  _id: string;
  glucoseLevel: number;
  timeOfMeasurement: string;
  mealContext: string;
  notes?: string;
};

export default function HomePage() {
  // Retrieves the authenticated session and handles authentication 
  const { data: session, status } = useSession();
  const router = useRouter();

  // Variables for handling form input values when adding/editing a glucose reading
  const [glucoseLevel, setGlucoseLevel] = useState("");
  const [timeOfMeasurement, setTimeOfMeasurement] = useState("");
  const [mealContext, setMealContext] = useState("Before Meal");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  // Handles glucose readings and managses table data
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalPages = 3;

  // Tracks which glucose reading is being edited
  const [updatingID, setupdatingID] = useState<string | null>(null);

  // Redirects to login page if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetches glucose readings when page loads
  useEffect(() => {
    if (session) {
      fetchGlucoseReadings(currentPage);
    }
  }, [session, currentPage]);

  // Fetches glucose readings from API
  const fetchGlucoseReadings = async (pageNumber: number) => {
    try {
      const response = await fetch(`/api/glucose?page=${pageNumber}&limit=${resultsPerPage}`);
      const data = await response.json();

      // Sorts pulled readings by descending order using timestamp
      if (response.ok && data.readings) {
        setGlucoseReadings(
          data.readings.sort((a: GlucoseEntry, b: GlucoseEntry) => {
            const dateA = new Date(a.timeOfMeasurement).getTime(); 
            const dateB = new Date(b.timeOfMeasurement).getTime(); 
            return dateB - dateA;
          })
        );
      }
    } catch {
      setGlucoseReadings([]);
    }
  };

  // Handles form submission for adding a new glucpose reading
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const glucoseData = {
      glucoseLevel: parseInt(glucoseLevel, 10),
      timeOfMeasurement,
      mealContext,
      notes,
    };

    try {
      const response = await fetch("/api/glucose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(glucoseData),
      });

      if (response.ok) {
        setMessage("Glucose reading saved successfully");
        resetForm(); // Clears the form after submission
        fetchGlucoseReadings(1); // Reloads  to show the latest data
      } else {
        setMessage("Failed to save the glucose reading");
      }
    } catch {
      setMessage("Error saving data");
    }
  };

  // Populates the form fields with the already existing data when updating a glucose reading
  const handleEdit = (reading: GlucoseEntry) => {
    setGlucoseLevel(reading.glucoseLevel.toString());
    setTimeOfMeasurement(new Date(reading.timeOfMeasurement).toISOString().slice(0, 16));
    setMealContext(reading.mealContext);
    setNotes(reading.notes || "");
    setupdatingID(reading._id);
  };

  // Submits updated data to the DB
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!updatingID) return;

    const updatedData = {
      glucoseLevel: parseInt(glucoseLevel, 10),
      timeOfMeasurement,
      mealContext,
      notes,
    };

    try {
      const response = await fetch(`/api/glucose/${updatingID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        setMessage("Glucose reading updated successfully");
        resetForm();  // Resets the form after update
        setupdatingID(null); // Stops the editing mode
        fetchGlucoseReadings(currentPage);  // Reloads the page with updated data
      } else {
        setMessage("Failed to update glucose reading");
      }
    } catch {
      setMessage("Error updating data");
    }
  };

  // Resets form fields
  const resetForm = () => {
    setGlucoseLevel("");
    setTimeOfMeasurement("");
    setMealContext("Before Meal");
    setNotes("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#D7AAFA] text-white">
      
      {/* Form for Add/Update */}
      <div className={`bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-md`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {updatingID ? "Update Glucose Reading" : "Add Glucose Reading"}
        </h2>
        {message && <p className="text-center text-sm text-gray-800">{message}</p>}
        <form onSubmit={updatingID ? handleUpdate : handleSubmit} className="flex flex-col gap-4">
          <input type="number" placeholder="Glucose Level (mg/dL)" value={glucoseLevel} onChange={(e) => setGlucoseLevel(e.target.value)} required className="border p-2 rounded-md text-black" />
          <input type="datetime-local" value={timeOfMeasurement} onChange={(e) => setTimeOfMeasurement(e.target.value)} required className="border p-2 rounded-md text-black" />
          <select value={mealContext} onChange={(e) => setMealContext(e.target.value)} className="border p-2 rounded-md text-black">
            <option value="Before Meal">Before Meal</option>
            <option value="After Meal">After Meal</option>
            <option value="Fasting">Fasting</option>
          </select>
          <textarea value={notes} placeholder="Notes (optional)" onChange={(e) => setNotes(e.target.value)} className="border p-2 rounded-md text-black" />
          <button type="submit" className="bg-[#1F1A5E] text-white py-2 px-4 rounded-md hover:bg-[#15114A]">
            {updatingID ? "Update" : "Submit"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-2xl">
        <>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-black">
                <th className="border p-2">Glucose Level</th>
                <th className="border p-2">Time</th>
                <th className="border p-2">Meal Context</th>
                <th className="border p-2">Notes</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {glucoseReadings.map((entry) => (
                <tr key={entry._id}>
                  <td className="border p-2 text-black">{entry.glucoseLevel}</td>
                  <td className="border p-2 text-black">{new Date(entry.timeOfMeasurement).toLocaleString()}</td>
                  <td className="border p-2 text-black">{entry.mealContext}</td>
                  <td className="border p-2 text-black">{entry.notes || "N/A"}</td>
                  <td className="border p-2">
                    <button onClick={() => handleEdit(entry)} className="text-blue-500 underline">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            {[1, 2, 3].map((num) => (
              <button key={num} onClick={() => setCurrentPage(num)} className={`px-4 py-2 mx-1 rounded-md ${currentPage === num ? 'bg-[#1F1A5E] text-white' : 'bg-[#D7AAFA] text-black'}`}>
                {num}
              </button>
            ))}
          </div>
        </>
      </div>
    </div>
  );
}