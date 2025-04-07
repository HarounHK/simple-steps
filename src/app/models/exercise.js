import mongoose, { Schema, models } from "mongoose";

const exerciseSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    activityName: {
      type: String,
      required: true,
    },
    caloriesBurned: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Exercise = models.Exercise || mongoose.model("Exercise", exerciseSchema);
export default Exercise;
