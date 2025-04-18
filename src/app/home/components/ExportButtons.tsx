"use client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { GlucoseEntry } from "@/types";

type Props = {
  glucoseData: GlucoseEntry[];
};

export default function ExportButtons({ glucoseData }: Props) {
  const average = Math.round(
    glucoseData.reduce((sum: number, entry: GlucoseEntry) => sum + entry.glucoseLevel, 0) /
      glucoseData.length
  );

  const latest = glucoseData.at(-1);
  const lastUpdated = latest
    ? new Date(latest.timeOfMeasurement).toLocaleString()
    : "N/A";

  const handlePDFDownload = async () => {
    const input = document.getElementById("chartSection");
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const now = new Date().toLocaleString();

    // Title & Meta
    pdf.setFontSize(18);
    pdf.text("Simple Steps: Glucose Report", 14, 20);

    pdf.setFontSize(10);
    pdf.text(`Generated: ${now}`, 14, 26);
    pdf.text(`Last Reading: ${lastUpdated}`, 14, 31);

    // Chart Image
    pdf.setFontSize(12);
    pdf.text("Visual Chart Snapshot:", 14, 40);
    pdf.addImage(imgData, "PNG", 14, 45, 180, 90);

    // Summary Stats
    pdf.setFontSize(12);
    pdf.text("Summary:", 14, 140);
    pdf.setFontSize(10);
    pdf.text(`Total Readings: ${glucoseData.length}`, 14, 148);
    pdf.text(`Average Glucose: ${average} mg/dL`, 14, 155);

    // Data Table (last 5 readings)
    pdf.setFontSize(12);
    pdf.text("Last 5 Readings:", 14, 165);
    pdf.setFontSize(10);
    const recent = glucoseData.slice(-5).reverse();
    recent.forEach((entry: GlucoseEntry, idx: number) => {
      const t = new Date(entry.timeOfMeasurement).toLocaleString();
      pdf.text(`${t} - ${entry.glucoseLevel} mg/dL`, 14, 172 + idx * 6);
    });

    // Footer
    pdf.setFontSize(8);
    pdf.text("Generated using Simple Steps – © 2024", 14, 290);

    pdf.save("glucose-report.pdf");
  };

  const handleCSVDownload = () => {
    const csv = [
      ["Time", "Glucose Level"],
      ...glucoseData.map((entry: GlucoseEntry) => [
        new Date(entry.timeOfMeasurement).toLocaleString(),
        entry.glucoseLevel,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "glucose-data.csv";
    link.click();
  };

  return (
    <div className="flex gap-4 mt-4">
      <button onClick={handlePDFDownload} className="px-4 py-2 bg-blue-600 text-white rounded">
        Download PDF Report
      </button>
      <button onClick={handleCSVDownload} className="px-4 py-2 bg-green-600 text-white rounded">
        Download CSV
      </button>
    </div>
  );
}
