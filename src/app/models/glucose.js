import mongoose, { Schema, models } from "mongoose";

const glucoseSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Linking to correct user
    glucoseLevel: { type: Number, required: true }, 
    timeOfMeasurement: { type: Date, required: true},
    mealContext: { type: String, enum: ["Fasting", "Before Meal", "After Meal", "Random"], required: true }, 
    notes: { type: String }, 
    source: { type: String, enum: ["Manual", "Dexcom"], required: true }, // Indicating if data is manually entered or pulled from Dexcom (Helps Seperate Context)
    trend: { type: String, enum: ["Rising", "Falling", "Steady", "Unknown"], default: "Unknown" } // Dexcom users have this field while manual users will have to input data for a trend to form
  },
  { timestamps: true } //Tracks When data wwas added/updated
);

const Glucose = models.Glucose || mongoose.model("Glucose", glucoseSchema);
export default Glucose;