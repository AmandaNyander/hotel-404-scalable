import { deleteBooking, createBooking, getBookingForUser } from "../../controllers/bookingController";
import { authenticateJWT } from "../../controllers/auth";
import express from 'express';
import { logging } from "../../logging";
const bookingRouter = express.Router();
// Route to create a booking with JWT authentication
bookingRouter.post("/", authenticateJWT, async function(req, res){
    logging("Authenticating user"); 
    const hotelID = req.body.hotelID;
    const user = req.user;
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
    console.log(hotelID, user, from_date, to_date); 
    try {
        const bookingDone = await createBooking(hotelID, user, from_date, to_date);
        logging("Auth successful!"); 
        res.status(201).send("booking successful!");
    } catch (error){
        logging("Auth unsuccessful!"); 
        res.status(400).send(error);
    }
});
// Route to delete a booking by ID
bookingRouter.delete("/", async function(req, res) {
    logging("Deleting booking"); 
    const bookingId = req.body.bookingId;

    try {
        const bookingDeleted = await deleteBooking(bookingId);
        res.status(200).send();
    } catch {
        res.status(400).send();
    }
});
// Route to get bookings for the authenticated user
bookingRouter.get("/", authenticateJWT, async function(req, res){
  logging("Getting bookings"); 
  const username = req.user; 
  const bookings = await getBookingForUser(username);
  console.log(bookings); 
  res.send(bookings).status(200); 
})

export default bookingRouter;
