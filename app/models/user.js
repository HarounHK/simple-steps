import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {type: String,required: true,},
    email: {type: String,required: true,},
    password: {type: String,required: true,},
    sex: {type: String,default: "",},
    age: {type: Number,default: 0,},
    height: {type: Number,default: 0,},
    weight: {type: Number,default: 0,},
    diabetesType: {type: String,default: "",},
    targetWeight: {type: Number,default: 0,},
    activityLevel: {type: String,enum: ["Not Very", "Lightly Active", "Active", "Very Active"],required: true,},
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);

export default User;