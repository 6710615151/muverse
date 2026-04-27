import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import usersRoutes    from "./routes/usersRoutes.js";
import pageRoutes       from "./routes/pageRoutes.js";
import requestRoutes       from "./routes/requestsRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import stocksRoutes from "./routes/stocksRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import categories from "./routes/categoriesRoutes.js";
import serviceTypes from "./routes/serviceTypesRoutes.js"
import sellerRoutes from "./routes/sellerRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import upload from "./routes/uploadRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"


import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { PUBLIC_DIR } from "./config/paths.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.use("/api/user",    usersRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/stock", stocksRoutes);
app.use("/api/order", ordersRoutes);
app.use("/api/category", categories);
app.use("/api/serviceTypes", serviceTypes);
app.use("/api/seller", sellerRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api", upload);


app.use("/", pageRoutes);

app.use(errorHandler);


if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`CN230 MU-Verse running at http://localhost:${PORT}`);
  });
}

export default app;
