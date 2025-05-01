"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Components
import Card from "./components/card";
import GlucoseLineChart from "./components/GlucoseLineChart";
import GlucoseBarChart from "./components/GlucoseBarChart";
import WeeklySummary from "./components/WeeklySummary";
import ExportButtons from "./components/ExportButtons";
import AlertBanner from "./components/AlertBanner";

// Types and models
import { GlucoseEntry } from "@/types";
import { trainPolynomialModel, predictNextGlucose } from "./components/GlucosePredictionModel";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  const [glucoseData, setGlucoseData] = useState<GlucoseEntry[]>([]);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [comparisonView, setComparisonView] = useState<"week" | "month">("month");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [predictedNext, setPredictedNext] = useState<number | string>("N/A");

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Ask for notification permission once on mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch glucose readings and do predictions
  useEffect(() => {
    const fetchGlucose = async () => {
      try {
        const res = await fetch("/api/glucose?page=1&limit=1000");
        const { readings }: { readings: GlucoseEntry[] } = await res.json();

        setGlucoseData(readings);
        checkForAlerts(readings);

        if (readings.length >= 3) {
          const model = trainPolynomialModel(readings);
          const prediction = predictNextGlucose(model);
          setPredictedNext(prediction);
        } else {
          setPredictedNext("N/A");
        }
      } catch (err) {
        console.error("Failed to fetch glucose data", err);
      }
    };

    fetchGlucose();
  }, []);

  // Check if any alerts should be shown based on recent readings
  const checkForAlerts = (data: GlucoseEntry[]) => {
    const latest = data.at(0);
    const previous = data.at(1);

    const predicted = latest && previous
      ? Math.round(latest.glucoseLevel + (latest.glucoseLevel - previous.glucoseLevel) * 0.5)
      : null;

    if (!latest) return;

    const time = new Date(latest.timeOfMeasurement).toLocaleTimeString();
    const level = latest.glucoseLevel;

    let message = null;

    if (level > 250) {
      message = `High reading at ${time}: ${level} mg/dL`;
    } else if (level < 70) {
      message = `Low reading at ${time}: ${level} mg/dL`;
    } else if (predicted && predicted > 250) {
      message = `Predicted spike: ${predicted} mg/dL in 1 hour`;
    } else if (predicted && predicted < 70) {
      message = `Predicted drop: ${predicted} mg/dL in 1 hour`;
    }

    if (message) {
      setAlertMessage(message);
      if (Notification.permission === "granted") {
        new Notification("Glucose Alert", { body: message });
      }
    }
  };

  const latestReading = glucoseData.at(0)?.glucoseLevel ?? "N/A";

  // Calculates average glucose between a time range
  const averageByHourRange = (start: number, end: number) => {
    const filtered = glucoseData.filter((entry) => {
      const hour = new Date(entry.timeOfMeasurement).getHours();
      return hour >= start && hour < end;
    });

    const total = filtered.reduce((sum, e) => sum + e.glucoseLevel, 0);
    return filtered.length ? Math.round(total / filtered.length) : "N/A";
  };

  // Averages split by time
  const morningAvg = averageByHourRange(5, 12);
  const eveningAvg = averageByHourRange(12, 20);
  const nightAvg = (() => {
    const night1 = averageByHourRange(20, 24);
    const night2 = averageByHourRange(0, 5);
    if (night1 === "N/A" && night2 === "N/A") return "N/A";
    return Math.round(((+night1 || 0) + (+night2 || 0)) / 2);
  })();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-[#D7AAFA] text-white px-4 pt-32 text-center">
      <h1 className="text-3xl font-bold mb-4">Glucose Monitoring Dashboard</h1>

      <AlertBanner message={alertMessage} onClose={() => setAlertMessage(null)} />

      {/* Glucose summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full max-w-3xl">
        <Card title="Latest Reading" value={latestReading} />
        <Card title="Predicted Next Reading" value={predictedNext} />
      </div>

      {/* Average glucose by time of day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full max-w-3xl">
        <Card title="Avg Morning (All Time)" value={morningAvg} />
        <Card title="Avg Evening (All Time)" value={eveningAvg} />
        <Card title="Avg Night (All Time)" value={nightAvg} />
      </div>

      {/* Weekly summary, charts, and export buttons */}
      <div id="chartSection" className="w-full flex flex-col items-center">
        <div className="mb-6">
          <WeeklySummary glucoseData={glucoseData} />
        </div>

        {/* Time range switcher */}
        <div className="flex justify-center gap-4 mb-6">
          {["day", "week", "month"].map((option) => (
            <button
              key={option}
              onClick={() => setView(option as "day" | "week" | "month")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                view === option ? "bg-[#B580E4] text-white" : "bg-white text-black"
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Line chart for glucose trends */}
        <div className="bg-white p-4 rounded-xl w-full max-w-3xl mb-6">
          <GlucoseLineChart glucoseData={glucoseData} view={view} />
        </div>

        {/* Comparison view switcher */}
        <div className="flex justify-center gap-4 mb-4">
          {["week", "month"].map((type) => (
            <button
              key={type}
              onClick={() => setComparisonView(type as "week" | "month")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                comparisonView === type ? "bg-[#B580E4] text-white" : "bg-white text-black"
              }`}
            >
              {type === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>

        {/* Bar chart for comparisons */}
        <div className="bg-white p-4 rounded-xl w-full max-w-4xl mb-6">
          <GlucoseBarChart glucoseData={glucoseData} comparisonView={comparisonView} />
        </div>
      </div>

      {/* Data export buttons */}
      <div className="mb-10">
        <ExportButtons glucoseData={glucoseData} />
      </div>
    </div>
  );
}
