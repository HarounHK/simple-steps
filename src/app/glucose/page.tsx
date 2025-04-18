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

export default function GlucoseEntryPage() {
  // Retrieves the authenticated session and handles authentication
  const { data: session, status } = useSession();
  const router = useRouter();

  // Tracks user tracking mode "manual" or "dexcom"
  const [trackingMode, setTrackingMode] = useState("manual");
  const [dexcomAuthorized, setDexcomAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Variables for handling form input values when adding/editing a glucose reading
  const [glucoseLevel, setGlucoseLevel] = useState("");
  const [timeOfMeasurement, setTimeOfMeasurement] = useState("");
  const [mealContext, setMealContext] = useState("Before Meal");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  // Handles glucose readings and manages table data
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

  // Fetches user profile info and sets tracking mode
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const profileResponse = await fetch("/api/profile");
        const profileData = await profileResponse.json();

        const mode = profileData.user.trackingMode || "manual";
        setTrackingMode(mode);

        // Checks Dexcom authorization if mode is Dexcom
        if (mode === "dexcom") {
          const dexcomResponse = await fetch("/api/dexcom/status", {
            credentials: "include",
          });
          const dexcomData = await dexcomResponse.json();
          setDexcomAuthorized(dexcomData.authorized);
        }
      } catch (error) {
        console.error("error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUserStatus();
    }
  }, [session]);

  // Fetches glucose readings when page loads or changes
  useEffect(() => {
    if (!session) return;
    if (trackingMode === "manual" || (trackingMode === "dexcom" && dexcomAuthorized)) {
      fetchGlucoseReadings(currentPage);
    }
  }, [session, currentPage, trackingMode, dexcomAuthorized]);

  // Fetches glucose readings from the backend API
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
    } catch (error) {
      console.log("error:", error);
      setGlucoseReadings([]);
    }
  };

  // Triggers Dexcom simulation every 5 minutes
  useEffect(() => {
    if (!(session && trackingMode === "dexcom" && dexcomAuthorized)) return;

    const interval = setInterval(() => {
      fetch("/api/dexcom/simulate", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Dexcom simm response:", data);
          fetchGlucoseReadings(currentPage);
        })
        .catch((error) => {
          console.error("error:", error);
        });
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [session?.user?.email, trackingMode, dexcomAuthorized]);

  // Handles form submission for adding a new glucose reading
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

      const result = await response.json();
      console.log("submit response:", result);

      if (response.ok) {
        setMessage("Glucose reading saved successfully");
        resetForm();
        fetchGlucoseReadings(1);
      } else {
        setMessage("Failed to save the glucose reading");
      }
    } catch (error) {
      console.log("error:", error);
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
      const result = await response.json();
      console.log("update response", result);

      if (response.ok) {
        setMessage("Glucose reading updated successfully");
        resetForm();
        setupdatingID(null);
        fetchGlucoseReadings(currentPage);
      } else {
        setMessage("Failed to update glucose reading");
      }
    } catch (error) {
      console.log("error:", error);
      setMessage("Error updating data");
    }
  };

  // Resets the form to initial empty state
  const resetForm = () => {
    setGlucoseLevel("");
    setTimeOfMeasurement("");
    setMealContext("Before Meal");
    setNotes("");
  };

  if (loading) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center pt-20 min-h-screen w-full bg-[#D7AAFA] text-white">
      <h1 className="text-3xl font-bold mt-6">Glucose Readings</h1>

      {/* Manual mode form */}
      {trackingMode === "manual" && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {updatingID ? "Update Glucose Reading" : "Add Glucose Reading"}
          </h2>
          {message && <p className="text-center text-sm text-gray-800">{message}</p>}

          <form onSubmit={updatingID ? handleUpdate : handleSubmit} className="flex flex-col gap-4">
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
              value={notes}
              placeholder="Notes (optional)"
              onChange={(e) => setNotes(e.target.value)}
              className="border p-2 rounded-md text-black"
            />
            <button
              type="submit"
              className="bg-[#1F1A5E] text-white py-2 px-4 rounded-md hover:bg-[#15114A]"
            >
              {updatingID ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      )}

      {/* Dexcom user not yet authorized */}
      {trackingMode === "dexcom" && !dexcomAuthorized ? (
        <div className="mt-6">
          <button
            onClick={() => router.push("/api/dexcom/auth")}
            className="bg-[#1F1A5E] text-white py-2 px-6 rounded-md hover:bg-[#15114A]"
          >
            Authorize Dexcom
          </button>
        </div>
      ) : null}

      {/* Glucose readings table */}
      {(trackingMode === "manual" || (trackingMode === "dexcom" && dexcomAuthorized)) && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 w-full max-w-2xl mb-10">
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
                    <td className="border p-2 text-black">
                      {new Date(entry.timeOfMeasurement).toLocaleString()}
                    </td>
                    <td className="border p-2 text-black">{entry.mealContext}</td>
                    <td className="border p-2 text-black">{entry.notes || "N/A"}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="bg-[#1F1A5E] text-white px-3 py-1 rounded-md hover:bg-[#15114A] transition"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`px-4 py-2 mx-1 rounded-md ${
                    currentPage === num ? "bg-[#1F1A5E] text-white" : "bg-[#D7AAFA] text-black"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </>
        </div>
      )}
    </div>
  );
}
