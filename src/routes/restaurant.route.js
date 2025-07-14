import express from "express";
const router = express.Router();

import {
  fetchRestaurant,
  getUserTips,
  restaurantDetails,
  searchRestaurant,
} from "../controller/restaurantController.js";

router.post("/", fetchRestaurant);
router.get("/search", searchRestaurant);
router.get("/:id", restaurantDetails);
router.get("/:id/tips", getUserTips);

export default router;
