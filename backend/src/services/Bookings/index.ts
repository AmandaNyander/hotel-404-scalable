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

mongoose.connect(mongoURI)
.then(()=> {
    logging('Booking service connected to MongoDB Atlas');
})
.catch(err => {
    logging(`MongoDB connection error: ${err}`);
  });

app.use("/", bookingRouter)

app.use((req, _, next) => {
  logging(`Endpoint: ${req.path}, method: ${req.method}`); 
  next(); 
}); 

app.listen(7703, () => {
  logging("Booking service listening on port 7703"); 
})

export default app;