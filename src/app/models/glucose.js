import mongoose, { Schema, models } from "mongoose";

const glucoseSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    glucoseLevel: { type: Number, required: true }, 
    timeOfMeasurement: { type: Date, required: true},
    mealContext: { type: String, enum: ["Fasting", "Before Meal", "After Meal", "Random"], required: true }, 
    notes: { type: String }, 
    source: { type: String, enum: ["Manual", "Dexcom"], required: true }, 
    trend: { type: String, enum: ["Rising", "Falling", "Steady", "Unknown"], default: "Unknown" } 
  },
  { timestamps: true } 
);

const Glucose = models.Glucose || mongoose.model("Glucose", glucoseSchema);
export default Glucose;