"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

import { GlucoseEntry } from "@/types";

// Registering required Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

type Props = {
  glucoseData: GlucoseEntry[];
  view: string; 
};

// Line chart for glucose trends over a selected time period
export default function GlucoseLineChart({ glucoseData, view }: Props) {
  const now = new Date();

  // Filter readings by selected view range
  const filteredData = glucoseData
    .filter((entry) => {
      const date = new Date(entry.timeOfMeasurement);
      const diff = now.getTime() - date.getTime();
      if (view === "day") return diff <= 1 * 24 * 60 * 60 * 1000;
      if (view === "week") return diff <= 7 * 24 * 60 * 60 * 1000;
      if (view === "month") return diff <= 30 * 24 * 60 * 60 * 1000;
      return false;
    })
    .sort((a, b) => new Date(a.timeOfMeasurement).getTime() - new Date(b.timeOfMeasurement).getTime());

  // X-axis labels formatted as short day and time
  const labels = filteredData.map((entry) =>
    new Date(entry.timeOfMeasurement).toLocaleString("en-GB", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  // Glucose values to be plotted
  const glucoseLevels = filteredData.map((entry) => entry.glucoseLevel);

  // Chart dataset configuration
  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Glucose Level (mg/dL)",
        data: glucoseLevels,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        pointBackgroundColor: glucoseLevels.map((val) =>
          val > 180 ? "red" : val < 70 ? "blue" : "white"
        ),
      },
    ],
  };

  // Chart display options with glucose zone annotations
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Glucose Readings - ${view.toUpperCase()} View`,
      },
      annotation: {
        annotations: {
          // Safe range zone
          safeZone: {
            type: "box",
            yMin: 80,
            yMax: 140,
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 0,
          },
          // High threshold line
          highZone: {
            type: "line",
            yMin: 180,
            yMax: 180,
            borderColor: "rgba(239, 68, 68, 0.8)",
            borderWidth: 2,
            label: {
              display: (ctx) =>
                !!ctx.chart.tooltip && ctx.chart.tooltip.opacity > 0,
              content: "High Threshold",
              backgroundColor: "rgba(239, 68, 68, 0.8)",
              color: "white",
              position: "end",
            },
          },
          // Low threshold line
          lowZone: {
            type: "line",
            yMin: 70,
            yMax: 70,
            borderColor: "rgba(59, 130, 246, 0.8)",
            borderWidth: 2,
            label: {
              display: (ctx) =>
                !!ctx.chart.tooltip && ctx.chart.tooltip.opacity > 0,
              content: "Too Low",
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              color: "white",
              position: "end",
            },
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Glucose (mg/dL)",
        },
      },
    },
  };

  return <Line data={lineChartData} options={lineChartOptions} />;
}