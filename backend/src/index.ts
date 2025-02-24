
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


mongoose.connect(mongoURI)
  .then(() => {
    logging('Connected to MongoDB Atlas');
  })
  .catch(err => {
    logging(`MongoDB connection error: ${err}`);
  });


app.use('/api/user', async (req, res) => {
  try {
    logging("Path: " + "http://localhost:7701" + req.path);
    let response;
    switch (req.method) {
      case 'POST': 
        console.log(req.body); 
        response = await axios.post("http://localhost:7701" + req.path, req.body); 
        break; 
      case 'DELETE': 
        response = await axios.delete("http://localhost:7701" + req.path, req.body); 
        break; 
      case 'GET': 
        response = await axios.get("http://localhost:7701" + req.path, req.body); 
        break; 
    }
    res.json(response.data); 
  } catch(error) {
    logging("Failed communication with user API"); 
    res.status(500).json({error: 'Error communicating with user API'}); 
  }
}); 

app.use('/api/hotels', async (req, res) => {
  try {
    logging("Path: " + "http://localhost:7702" + req.path);
    let response;
    switch (req.method) {
      case 'POST': 
        console.log(req.body); 
        response = await axios.post("http://localhost:7701" + req.path, req.body); 
        break; 
      case 'DELETE': 
        response = await axios.delete("http://localhost:7701" + req.path, req.body); 
        break; 
      case 'GET': 
        response = await axios.get("http://localhost:7701" + req.path, req.body); 
        break; 
    }
    res.json(response.data); 
  } catch(error) {
    logging("Failed communication with user API"); 
    res.status(500).json({error: 'Error communicating with user API'}); 
  }
});
app.use('/api/booking', async (req, res) => {
  try {
    logging("Path: " + "http://localhost:7703" + req.path);
    let response;
    switch (req.method) {
      case 'POST': 
        console.log(req.body); 
        response = await axios.post("http://localhost:7701" + req.path, req.body); 
        break; 
      case 'DELETE': 
        response = await axios.delete("http://localhost:7701" + req.path, req.body); 
        break; 
      case 'GET': 
        response = await axios.get("http://localhost:7701" + req.path, req.body); 
        break; 
    }
    res.json(response.data); 
  } catch(error) {
    logging("Failed communication with user API"); 
    res.status(500).json({error: 'Error communicating with user API'}); 
  }
});

/* Old routing
app.use("/api/hotels", hotelRouter); 
app.use("/api/user", userRouter);
app.use("/api/booking", bookingRouter); 
*/
app.use((req, _, next) => {
  logging(`Endpoint: ${req.path}, method: ${req.method}`);
  next();
});


// Start server
app.listen(7700, () => {
  logging("Listening on port 7700");
}); 
