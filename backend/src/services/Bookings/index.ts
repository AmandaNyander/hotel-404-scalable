import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import 'dotenv/config';
import { logging } from '../../logging';
import cookieParser from 'cookie-parser';
import bookingRouter from './bookingRouter';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.set("trust proxy",1);

const mongoURI : string = process.env.DB_CONNECTION_STRING as string;

if (process.env.NODE_ENV !== "test") {
  mongoose.connect(mongoURI)
  .then(()=> {
      logging('Booking service connected to MongoDB Atlas');
  })
  .catch(err => {
      logging(`MongoDB connection error: ${err}`);
    });
}

app.get("/", (req, res) => {
  res.status(200).send("Hello world!");
})

app.use((req, _, next) => {
  logging(`Endpoint: ${req.path}, method: ${req.method}`); 
  next(); 
}); 

app.use("/", bookingRouter)

export default app;

if (require.main === module) {
  app.listen(7703, () => {
    logging("Booking service listening on port 7703"); 
  })
}


