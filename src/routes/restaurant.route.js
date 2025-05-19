import express from "express";
const router = express.Router();

import {
  fetchRestaurant,
  getUserTips,
  restaurantDetails,
  searchRestaurant,
} from "../controller/restaurantController.js";

router.post("/restaurant", fetchRestaurant);
router.get("/restaurant/search", searchRestaurant);
router.get("/restaurant/:id", restaurantDetails);
router.get("/restaurant/:id/tips", getUserTips);

export default router;
