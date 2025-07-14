import express from "express";
import cors from "cors";
import connectdb from "./src/utils/db.js";
import dotenv from "dotenv";

dotenv.config();

connectdb();

const app = express();

const corsOptions = {
  origin: [process.env.FRONT_END_URL, "http://localhost:3000"],
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(express.json());

import restaurantRoutes from "./src/routes/restaurant.route.js";

app.get("/api/test", (req, res) => res.send("OK"));
app.use("/api/restaurant", restaurantRoutes);

export default app;
