import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./userRouter";
import { logging } from "../../logging";
import session from "express-session";

function createServer() {
  const app = express();

  app.get('./health', (req, res) => {
    logging("Health check recieved");
    res.status(200).send('OK');
  })

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, //store cookies for 30 mins
    sameSite: 'none',
    secure: true
  }
}

  )); 

  app.set("trust proxy", 1);
  app.use(userRouter);

  app.use((req, _, next) => {
    logging(`Endpoint: ${req.path}, method: ${req.method}`);
    next();
  });

  app.listen(7701, () => {
    logging("User service is listening on port 7701");
  })

  return app; 
}

export default createServer; 
