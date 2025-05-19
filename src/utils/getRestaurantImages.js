import axios from "axios";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const fourSquareUrl = process.env.FOURSQUARE_URI;
const fourSquareKey = process.env.FOURSQUARE_SECTRET_KEY;

const imageCache = new NodeCache({ stdTTL: 3600 });

export const getImageForRestaurant = async (fsqId) => {
  try {
    const cachedImages = imageCache.get(fsqId);

    if (cachedImages) {
      return cachedImages;
    }

    const imgRes = await axios.get(`${fourSquareUrl}/${fsqId}/photos`, {
      headers: {
        Authorization: fourSquareKey,
      },
    });

    const imageData = imgRes.data.map((image) => ({
      url: `${image.prefix}original${image.suffix}`,
      width: image.width,
      height: image.height,
    }));

    imageCache.set(fsqId, imageData);

    return imageData;
  } catch (error) {
    console.error(`Failed to fetch images for ${fsqId}:`, error.message);
    return [];
  }
};
