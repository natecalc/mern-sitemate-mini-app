import mongoose from "mongoose";
import dotenv from "dotenv";
import { MONGODB_URI } from "../constants/env";

dotenv.config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("--> Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToDatabase;
