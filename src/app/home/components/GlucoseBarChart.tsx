"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { GlucoseEntry } from "@/types";

// Registering required Chart.js modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  glucoseData: GlucoseEntry[];
  comparisonView?: "week" | "month"; // Toggle for weekly or monthly averages
};

// Renders a grouped bar chart for average glucose levels per time of day
export default function GlucoseBarChart({ glucoseData, comparisonView = "month" }: Props) {
  // Organize entries by label (month or week), then split by time of day
  const groups = new Map<string, { morning: number[]; evening: number[]; night: number[] }>();

  glucoseData.forEach((entry) => {
    const date = new Date(entry.timeOfMeasurement);
    const month = date.toLocaleString("default", { month: "short" });
    const week = Math.ceil(date.getDate() / 7);
    const label = comparisonView === "month" ? month : `${month} Week ${week}`;

    const hour = date.getHours();
    const part =
      hour >= 5 && hour < 12 ? "morning" :
      hour >= 12 && hour < 20 ? "evening" :
      "night";

    if (!groups.has(label)) {
      groups.set(label, { morning: [], evening: [], night: [] });
    }

    groups.get(label)![part].push(entry.glucoseLevel);
  });

  // Prepare sorted label groups and compute dataset values
  const sorted = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  const labels = sorted.map(([label]) => label);

  const dataset = (timeOfDay: "morning" | "evening" | "night") =>
    sorted.map(([, values]) =>
      values[timeOfDay].length
        ? Math.round(values[timeOfDay].reduce((a, b) => a + b, 0) / values[timeOfDay].length)
        : 0
    );

  // Bar chart data
  const barChartData = {
    labels,
    datasets: [
      {
        label: "Morning",
        data: dataset("morning"),
        backgroundColor: "#FACC15", 
      },
      {
        label: "Evening",
        data: dataset("evening"),
        backgroundColor: "#FB923C", 
      },
      {
        label: "Night",
        data: dataset("night"),
        backgroundColor: "#8B5CF6", 
      },
    ],
  };

  // Chart configuration
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text:
          comparisonView === "month"
            ? "Monthly Glucose Averages"
            : "Weekly Glucose Averages",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Glucose (mg/dL)",
        },
      },
    },
  };

  return <Bar data={barChartData} options={options} />;
}