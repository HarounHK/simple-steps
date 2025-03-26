import mongoose, { Schema, models } from "mongoose";

const nutritionSchema = new Schema(
  {
    userId: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,},
    date: {type: Date,required: true,},
    mealType: {type: String,enum: ["Breakfast", "Lunch", "Dinner", "Snacks"],required: true,},
    foodName: {type: String,required: true,},
    grams: {type: Number,required: true,},
    calories: {type: Number,required: true,},
    protein: {type: Number,required: true,},
    carbs: {type: Number,required: true,},
    fat: {type: Number,required: true,},
    sugar: {type: Number,required: true,},
  },
  { timestamps: true }
);

const nutrition = models.nutrition || mongoose.model("nutrition", nutritionSchema);

export default nutrition;
