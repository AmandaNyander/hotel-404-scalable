import express from "express";
import mongoose from "mongoose";
import hotelRouter from "./hotelRouter";
import { logging } from "../../logging";
import cookieParser from "cookie-parser";
import 'dotenv/config';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy", 1);

const mongoURI: string = process.env.DB_CONNECTION_STRING as string;

mongoose.connect(mongoURI)
  .then(() => {
    logging('User service connected to MongoDB Atlas');
  })
  .catch(err => {
    logging(`MongoDB connection error: ${err}`);
  });

app.use("/", hotelRouter); 

app.use((req, _, next) => {
  logging(`Endpoint: ${req.path}, method: ${req.method}`); 
  next(); 
}); 

app.listen(7701, () => {
  logging("User service listening on port 7702"); 
})
