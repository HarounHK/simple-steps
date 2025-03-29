import mongoose from "mongoose";
const MONGO_URI = process.env.MONGODB_URI;

// Connecting to MongoDB Server
export const connectMongoDB = async () => {

    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        throw new Error("Failed to connect to MongoDB.");
    }
};
