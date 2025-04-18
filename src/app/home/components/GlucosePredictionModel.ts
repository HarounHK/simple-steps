import { GlucoseEntry } from "@/types";
import { PolynomialRegression } from "ml-regression-polynomial";

// Normalize a value
const normalize = (val: number, min: number, max: number) => (val - min) / (max - min);

// Train polynomial regression on glucose data
export function trainPolynomialModel(glucoseData: GlucoseEntry[]) {
  const values = glucoseData.map((entry) => entry.glucoseLevel);
  const timestamps = glucoseData.map((entry) => new Date(entry.timeOfMeasurement).getTime());

  if (values.length < 3) throw new Error("Not enough data points for training");

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const normalizedX = timestamps.map((t) => normalize(t, minTime, maxTime));
  const degree = 3;

  const model = new PolynomialRegression(normalizedX, values, degree);

  console.log("📐 Coefficients:", model.coefficients);
  return { model, minTime, maxTime };
}

// Predict next glucose level one hour from now
export function predictNextGlucose({
  model,
  minTime,
  maxTime,
}: {
  model: PolynomialRegression;
  minTime: number;
  maxTime: number;
}) {
  const futureTime = new Date().getTime() + 60 * 60 * 1000;
  const normTime = normalize(futureTime, minTime, maxTime);
  const predicted = model.predict(normTime);
  console.log(`🔮 Predicted 1-hour ahead: ${Math.round(predicted)} mg/dL`);
  return Math.round(predicted);
}
