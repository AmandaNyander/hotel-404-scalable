import { createHotel, getHotels, getAllHotels, getHotelDocumentById} from "../controllers/hotelController";

import express from "express";
import { Request } from "express";
import { logging } from "../logging";
const hotelRouter = express.Router(); 
// Route to get all hotels
hotelRouter.get("/all", async function(req, res){
  logging("Retrieving all hotels"); 
  const hotels = await getAllHotels(); 
  res.status(200).send(hotels)
})
// Route to get available hotels based on city and date range
hotelRouter.get("/getHotels", async function(req, res){
  const city = req.query.city;
  logging("Retrieving hotels from city: " + city); 
  const fromDate = req.query.dateCheckIn; 
  const toDate = req.query.dateCheckOut;
  console.log("query:", req.query); 

  if(!fromDate || !toDate){
    logging("Date is null"); 
    res.status(400).send('invalid request');
    return; 
  }
  const result = await getHotels(city, fromDate, toDate);
  console.log("hotels:", result); 
  res.send(JSON.stringify(result)).status(200); 
})
// Route to get hotel details by hotel ID
hotelRouter.get("/hotelDetails", async (req: Request<{hotelId: string}>, res) => {
  logging("Getting hotel details for: "+ req.query.hotelId); 
  try{
    const query = req.query.hotelId ? String(req.query.hotelId) : "";
    const hotel = await getHotelDocumentById(query); 
    const result = {
      page: hotel.page, 
      hotel_img: hotel.hotel_img, 
      bath_img: hotel.bath_img, 
      hall_img: hotel.hall_img, 
      other_img: hotel.other_img, 
      food_img: hotel.food_img, 
      room_img: hotel.room_img
      
    };
    console.log(result); 
    res.status(200).send(result); 
  }
  catch{
    logging("hotel not fuond"); 
    res.sendStatus(400);
  }
})

// Route to create a new hotel
hotelRouter.post("/", async(req, res) => {
  logging("Creating new hotel..."); 
  try {
    logging("Creation of hotel successful"); 
    await createHotel(req.body); 
    res.status(201).send(); 
  }
  catch {
    logging("Creating hotel failed"); 
    res.sendStatus(401); 
  }
})
export default hotelRouter; 
