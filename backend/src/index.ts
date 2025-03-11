
import express from "express"; 
import mongoose from "mongoose";
import hotelRouter from "./Routers/hotelRouter";
import userRouter from "./Routers/userRouter";
import bookingRouter from "./Routers/bookingRouter";
import cors from 'cors';
import session from "express-session";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { logging } from "./logging";
import axios from "axios";
import proxy from "express-http-proxy"

declare module 'express-session' {
  export interface SessionData {
    isLoggedIn: boolean,
    username: string
  }
}

//Define custom environment variable for ProcessEnv
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_CONNECTION_STRING: string;
    }
  }
  namespace Express {
    interface Request {
      user?: string
    }
  }
}

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
// Parse incoming JSON request.
app.use(express.json());

app.use(cookieParser());

app.set("trust proxy", 1);
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, //store cookies for 30 mins
    sameSite: 'none',
    secure: true
  }
}));


axios.defaults.withCredentials = true; 
const mongoURI: string = process.env.DB_CONNECTION_STRING as string;

const userURI = process.env.USER_URI; 
const hotelURI = process.env.HOTEL_URI; 
const bookingURI = process.env.BOOKING_URI; 

logging(userURI ?? ""); 
logging(hotelURI ?? ""); 
logging(bookingURI ?? ""); 

mongoose.connect(mongoURI)
  .then(() => {
    logging('Connected to MongoDB Atlas');
  })
  .catch(err => {
    logging(`MongoDB connection error: ${err}`);
  });
app.use((req, _, next) => {
  logging(`Endpoint: ${req.path}, method: ${req.method}`);
  next();
});


app.use('/api/user',  (req, res, next) => {
  logging("Redirecting to user API"); 
  next(); 
},proxy(`http://${userURI}`)); 

app.use('/api/hotels', (req, res, next) => {
  logging("Redirecting to hotel API");
  next()
}, proxy(`http://${hotelURI}`));
app.use('/api/booking', (req, res, next) => {
  logging("Redirecting to booking API");
  next(); 
}, proxy(`http://${bookingURI}`));
/* Old routing
app.use("/api/hotels", hotelRouter); 
app.use("/api/user", userRouter);
app.use("/api/booking", bookingRouter); 
*/


// Start server
app.listen(7700, () => {
  logging("Listening on port 7700");
}); 
