import express from 'express';
import mongoose from "mongoose";
import userRouter from './userRouter';
import cors from 'cors';
import 'dotenv/config';
import { logging } from '../../logging';
import cookieParser from 'cookie-parser';
import createServer from './server';


const mongoURI: string = process.env.DB_CONNECTION_STRING as string;
if (process.env.NODE_ENV !== "test") {
  mongoose.connect(mongoURI)
    .then(() => {
      logging('User service connected to MongoDB Atlas');
    })
    .catch(err => {
      logging(`MongoDB connection error: ${err}`);
    });
}

const app = createServer(); 

export default app; 
