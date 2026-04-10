import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import studentRoutes    from "./routes/studentRoutes.js";
import courseRoutes     from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import pageRoutes       from "./routes/pageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { PUBLIC_DIR } from "./config/paths.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/students",    studentRoutes);
app.use("/api/courses",     courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// ─── Page Routes ─────────────────────────────────────────────────────────────
app.use("/", pageRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start (local dev only) ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 CN230 MU-Verse running at http://localhost:${PORT}`);
  });
}

export default app;
