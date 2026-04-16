import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import usersRoutes    from "./routes/usersRoutes.js";
import pageRoutes       from "./routes/pageRoutes.js";
import requestRoutes       from "./routes/requestsRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { PUBLIC_DIR } from "./config/paths.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;

//  Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

// API Routes
app.use("/api/user",    usersRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/wallet", walletRoutes);

//Page Routes
app.use("/", pageRoutes);

//  Error Handling
app.use(errorHandler);


if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`CN230 MU-Verse running at http://localhost:${PORT}`);
  });
}

export default app;
