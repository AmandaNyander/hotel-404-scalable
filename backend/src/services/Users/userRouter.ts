import { AuthLogin, newUser, deleteUser } from "./userController";
import { accessTokenSecret, authenticateJWT } from "../../controllers/auth";
import jwt from "jsonwebtoken";
import { logging } from "../../logging";
import { Request } from "express";

declare namespace Express {
  export interface Request{
    user?: string
  }
  export interface SessionData{
    isLoggedIn: boolean, 
    username: string
  }
}

import express from "express";
const userRouter = express.Router();
// Route to handle user login
userRouter.post("/login", async function(req, res, next) {
  logging(`POST request to login from ${req.socket.remoteAddress}`)
  const username = req.body.username;
  const password = req.body.password;
  try {
    logging("Auth user..."); 
    const validUser = await AuthLogin(username, password);
    logging("Auth successful!"); 
    const accessToken = jwt.sign({ username: username }, accessTokenSecret, { expiresIn: "20m" });
    res.cookie('token', accessToken, { httpOnly: true });
    res.sendStatus(201);
    logging(`${req.session}`)
    req.session.isLoggedIn = true;
    req.session.username = username;
    console.log(req.session.username);
    next();
  }
  catch (error) {
    console.log(error);
    res.status(400).send(error)
  }

});

// Route to handle user signup
userRouter.post("/signup", async function(req, res) {
  logging(`POST request to signup from ${req.socket.remoteAddress}`)
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const lastname = req.body.lastname;
  const age = req.body.age;
  const isAdmin = false;
  try {
    const createUser = await newUser(name, lastname, username, age, password, isAdmin);
    const accessToken = jwt.sign({ username: username }, accessTokenSecret, { expiresIn: "20m" });
    res.cookie('token', accessToken, { httpOnly: true });
    logging("Sending status 201"); 
    res.sendStatus(201);
  }
  catch (err){
    console.log(err); 
    res.sendStatus(400);
  }
})


// Route to delete a user (authenticated)
userRouter.delete("/deleteme", authenticateJWT, async function(req, res) {
  logging(`DELETE request to delete user from ${req.socket.remoteAddress}: ${req.user as string}`)
  const userID = req.user as string;
  try {
    const userDelete = await deleteUser(userID);
    res.cookie("token", "none", { maxAge: 1 });
    res.sendStatus(204);
  }
  catch {
    res.sendStatus(400);
  }
});
// Route to handle user logout (authenticated)
userRouter.get("/logout", authenticateJWT, async function(req, res) {
  logging(`GET request to logout user from ${req.socket.remoteAddress}: ${req.user as string}`)
  try {
    res.cookie("token", "none", { maxAge: 1 });
    res.sendStatus(200);
  } catch {
    res.sendStatus(400);
  }

});

// Route to check if a user is authenticated (session check)
userRouter.get("/session", authenticateJWT, (req, res) => {
  logging(`GET request to retrieve session from ${req.socket.remoteAddress}: ${req.user as string}`)
  res.sendStatus(200);
});



export default userRouter;


