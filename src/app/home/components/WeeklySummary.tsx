"use client";
import { GlucoseEntry } from "@/types";

type Props = {
  glucoseData: GlucoseEntry[];
};

export default function WeeklySummary({ glucoseData }: Props) {
  // Filters entries for a specific week 
  const getEntriesForWeek = (entries: GlucoseEntry[], weeksAgo: number) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    start.setDate(now.getDate() - 7 * (weeksAgo + 1));
    end.setDate(now.getDate() - 7 * weeksAgo);

    return entries.filter((entry) => {
      const timestamp = new Date(entry.timeOfMeasurement);
      return timestamp >= start && timestamp < end;
    });
  };

  // Calculates the average glucose value for the given entries
  const calculateAverage = (entries: GlucoseEntry[]) =>
    entries.length
      ? Math.round(entries.reduce((sum, entry) => sum + entry.glucoseLevel, 0) / entries.length)
      : 0;

  // Returns the count of high readings (>180 mg/dL)
  const countHighValues = (entries: GlucoseEntry[]) =>
    entries.filter((entry) => entry.glucoseLevel > 180).length;

  // Returns the count of low readings (<70 mg/dL)
  const countLowValues = (entries: GlucoseEntry[]) =>
    entries.filter((entry) => entry.glucoseLevel < 70).length;

  // Finds the highest glucose reading in the dataset
  const getMaxReading = (entries: GlucoseEntry[]) =>
    entries.reduce((max, entry) => (entry.glucoseLevel > max.glucoseLevel ? entry : max), entries[0]);

  // Memoized weekly data to avoid unnecessary
  const thisWeek = getEntriesForWeek(glucoseData, 0);
  const lastWeek = getEntriesForWeek(glucoseData, 1);

  const thisWeekAvg = calculateAverage(thisWeek);
  const lastWeekAvg = calculateAverage(lastWeek);

  // Calculates percentage change between weeks
  const percentChange = lastWeekAvg
    ? Math.round(((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100)
    : 0;

  const highCount = countHighValues(thisWeek);
  const lowCount = countLowValues(thisWeek);
  const maxReading = thisWeek.length ? getMaxReading(thisWeek) : null;

  return (
    <div className="bg-white text-black p-4 rounded-xl shadow-md mt-4 w-full max-w-3xl text-sm text-left">
      <p>
        This weeks average glucose: <strong>{thisWeekAvg} mg/dL</strong> (
        {percentChange >= 0 ? "+" : ""}
        {percentChange}% compared to last week)
      </p>

      <p>
        Number of high readings (Above: 180 mg/dL): <strong>{highCount}</strong>
      </p>

      <p>
        Number of low readings (Below: 70 mg/dL): <strong>{lowCount}</strong>
      </p>

      {maxReading && (
        <p>
          Highest reading: <strong>{maxReading.glucoseLevel} mg/dL</strong> at{" "}
          {new Date(maxReading.timeOfMeasurement).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}