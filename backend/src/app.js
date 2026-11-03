import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import campRoutes from "./routes/campRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.set("trust proxy", 1); // Render sits behind a proxy

app.use(helmet());
app.use(
  cors({
    origin: true, // reflects whichever site is calling (login uses a token header, not cookies)
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many attempts, try again later" },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "BloodConnect API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/camps", campRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
