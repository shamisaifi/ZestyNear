import axios from "axios";
import dotenv from "dotenv";
import { getImageForRestaurant } from "../utils/getRestaurantImages.js";
import NodeCache from "node-cache";
dotenv.config();

const fourSquareUrl = process.env.FOURSQUARE_URI;
const fourSquareKey = process.env.FOURSQUARE_SECTRET_KEY;

// default fetching restaurant
const fetchRestaurant = async (req, res) => {
  const { lat, lon, radius, query, limit } = req.body;

  try {
    const response = await axios.get(`${fourSquareUrl}/search`, {
      headers: {
        Authorization: fourSquareKey,
      },
      params: {
        query: query || "dinning and drinking",
        categories: "13000",
        limit: limit || 20,
        ll: `${lat},${lon}`,
        radius: radius || 5000,
        sort: "rating",
      },
    });

    const restaurants = response.data.results;

    const restaurantWithImages = await Promise.allSettled(
      restaurants.map(async (restaurant) => {
        const images = await getImageForRestaurant(restaurant.fsq_id);
        return {
          ...restaurant,
          images,
        };
      })
    );

    const finalResult = restaurantWithImages.map((r) => {
      if (r.status === "fulfilled") {
        return r.value;
      } else {
        return {
          ...r.reason.restaurant,
          images: [],
        };
      }
    });

    res.status(200).json(finalResult);
  } catch (error) {
    console.error("Foursquare API Error:", error.message);
    res
      .status(500)
      .json({ message: "Failed to fetch restaurants", error: error.message });
  }
};

// search restaurant
const searchCache = new NodeCache({ stdTTL: 3600 });

const searchRestaurant = async (req, res) => {
  const { q, limit, sort, lat, lon } = req.query;
  const cacheKey = `search-${q?.toLowerCase().trim()}`;

  const cachedData = searchCache.get(cacheKey);
  if (cachedData) return res.status(200).json(cachedData);

  try {
    const searchResponse = await axios.get(`${fourSquareUrl}/search`, {
      headers: {
        Authorization: fourSquareKey,
      },
      params: {
        ll: `${lat},${lon}`,
        query: q,
        categories: "13000",
        limit: limit || 20,
        sort: sort || "RELEVANCE",
      },
    });

    const restaurants = searchResponse.data.results;

    const restaurantWithImages = await Promise.allSettled(
      restaurants.map(async (restaurant) => {
        try {
          const images = await getImageForRestaurant(restaurant.fsq_id);
          return { ...restaurant, images };
        } catch (err) {
          return { ...restaurant, images: [] };
        }
      })
    );

    const finalResult = restaurantWithImages
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    // Cache the enriched result
    searchCache.set(cacheKey, finalResult);
    setTimeout(() => searchCache.del(cacheKey), 120000);

    res.status(200).json(finalResult);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Search failed", details: error.message });
  }
};

// get a restauarant's details
const restaurantDetailsCache = new NodeCache({ stdTTL: 3600 });

const restaurantDetails = async (req, res) => {
  const { id } = req.params;
  const cachedData = restaurantDetailsCache.get(id);

  if (cachedData) return res.status(200).json(cachedData);

  try {
    const response = await axios.get(`${fourSquareUrl}/${id}`, {
      headers: {
        Authorization: fourSquareKey,
      },
    });

    const restaurant = response.data;
    const images = await getImageForRestaurant(id);

    const result = {
      restaurant,
      images,
    };

    restaurantDetailsCache.set(id, result);

    res.status(200).json(result);
  } catch (error) {
    console.error("Restaurant details fetch failed:", error.message);
    res.status(500).json({
      error: "Fetching restaurant details failed",
      details: error.message,
    });
  }
};

// get users tip for a restaurant
const getUserTips = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`${fourSquareUrl}/${id}/tips`, {
      headers: {
        Authorization: fourSquareKey,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching user tips:", error.message);
    res.status(500).json({ error: "Failed to fetch user tips", details: error.message });
  }
};

export { fetchRestaurant, searchRestaurant, restaurantDetails, getUserTips };
