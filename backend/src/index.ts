import express from "express";
import "dotenv/config";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import { OK } from "./constants/http";
import authRoutes from "./routes/auth.route";
import errorHandler from "./middleware/errorHandler";
import { authenticate } from "./middleware/authenticate";
import userRoutes from "./routes/user.route";
import sessionRoutes from "./routes/session.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN, // Replace with your frontend URL as it allows only that url to access the backend
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res, next) => {
  res.status(OK).json({ status: "Healthy!" });
});

// auth routes
app.use("/auth", authRoutes);

// protected routes
app.use("/user", authenticate, userRoutes);
app.use("/sessions", authenticate, sessionRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);

  await connectToDatabase();
});
