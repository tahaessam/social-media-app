import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/social-media-app";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("⚠️ MongoDB connection error:", error);
    console.warn("Continuing without database connection so the API can still boot for local testing.");
  }
};

export default connectDB;
