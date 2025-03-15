import mongoose, { Schema, models } from "mongoose";

/**
 * User schema for multi-step signup.
 * - Step 1 fields (name, email, password)
 * - Step 2 fields (sex, age, height, etc.)
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      // The user's name (entered during Step 1)
    },
    email: {
      type: String,
      required: true,
      // The user's email, used for login and unique identification
    },
    password: {
      type: String,
      required: true,
      // The hashed password (stored securely in the DB)
    },

    // --- New fields for Step 2 ---
    sex: {
      type: String,
      default: "",
      // "male", "female", or "other"
    },
    age: {
      type: Number,
      default: 0,
      // The user's age
    },
    height: {
      type: Number,
      default: 0,
      // The user's height (in cm)
    },
    weight: {
      type: Number,
      default: 0,
      // The user's current weight (in kg)
    },
    diabetesType: {
      type: String,
      default: "",
      // e.g. "type1", "type2", "gestational", "other"
    },
    targetWeight: {
      type: Number,
      default: 0,
      // The user's goal weight (in kg)
    },
    activityLevel: {
      type: String,
      enum: ["Not Very", "Lightly Active", "Active", "Very Active"],
      required: true,
      // The user's self-reported activity level (one of four enums)
    },
  },
  { timestamps: true }
);

// Reuse existing model if already compiled; otherwise compile a new one
const User = models.User || mongoose.model("User", userSchema);

export default User;
