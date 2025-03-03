import { deleteBooking, createBooking, getBookingForUser } from "../../controllers/bookingController";
import { authenticateJWT } from "../../controllers/auth";
import express from 'express';
import { logging } from "../../logging";
import { error } from "console";
const bookingRouter = express.Router();
// Route to create a booking with JWT authentication
bookingRouter.post("/", authenticateJWT, async function(req, res){
    logging(`Authenticating user: ${req.user}`); 
    const hotelID = req.body.hotelID;
    const user = req.user;
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
    console.log(hotelID, user, from_date, to_date); 
    try {
        const bookingDone = await createBooking(hotelID, user, from_date, to_date);
        logging(`Booking in hotel: ${hotelID} for user: ${user}, was successfully made`);
        res.status(201).send("booking successful!");
    } catch (error){
        logging(`An error occurred, while trying to make a booking for user: ${user} at hotel: ${hotelID}. Error: ${error}`); 
        res.status(400).send(error);
    }
});
// Route to delete a booking by ID
bookingRouter.delete("/", async function(req, res) {
    logging(`Got a request to delete the following booking: ${req.body.bookingId}`); 
    const bookingId = req.body.bookingId;

    try {
        const bookingDeleted = await deleteBooking(bookingId);
        logging(`Successefully deleted booking with ID: ${bookingId}`);
        res.status(200).send();
    } catch {
        logging(`An error occured while trying to delete a booking with ID: ${bookingId}. Error: ${error}`);
        res.status(400).send();
    }
});
// Route to get bookings for the authenticated user
bookingRouter.get("/", authenticateJWT, async function(req, res){
  logging(`Getting bookings for user: ${req.user}`); 
  const username = req.user; 
  const bookings = await getBookingForUser(username);
  console.log(bookings); 
  res.send(bookings).status(200); 
})

export default bookingRouter;
