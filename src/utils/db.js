import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUrl = `${process.env.MONGO_URI}${process.env.DB_NAME}`;

const connectdb = async () => {
  await mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log(`connected to database`);
    })
    .catch((err) => {
      console.log("mongo connection failed: " + err.message);
    });
};

export default connectdb;
