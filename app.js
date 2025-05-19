import express from "express";
import cors from "cors";
import connectdb from "./src/utils/db.js";
import dotenv from "dotenv";

dotenv.config();

connectdb();

const app = express();

app.use(cors());
app.use(express.json());

import restaurantRoutes from "./src/routes/restaurant.route.js";

app.use("/api", restaurantRoutes);

export default app;
