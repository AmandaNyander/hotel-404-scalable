import { Booking } from "../Bookings/Booking"; 
import { Hotel } from "./Hotel"; 
import { logging } from "../../logging";


// Fetch hotels, optionally filtered by city, and return only those available between the given dates
export async function getHotels(city: string | null, fromDate: string,  toDate: string){
  logging(`Searching for hotels ${city === null ? "" : `in city ${city}`} between ${fromDate} and ${toDate}`); 
  var hotels;
  if(city){
    hotels = await Hotel.find({'display.city': city}); 
  }
  else{
    hotels = await Hotel.find(); 
  }
  //Filter hotels that are unavailable
  const checkInDate = new Date(fromDate); 
  const checkOutDate = new Date(toDate); 
  var freeHotels = [];
  for(let hotel of hotels){
    const isFree = await hotelFreeBetweenDates(hotel, checkInDate, checkOutDate); 
    if(isFree){
      freeHotels.push(hotel); 
    }
  }
  return freeHotels; 
}
// Check if a hotel is available between the given dates
export async function hotelFreeBetweenDates(hotel:any, fromDate: Date, toDate: Date){
  const hotelId = hotel._id; 
  const bookings = await Booking.find({hotel: hotelId});
  for(let booking of bookings){
    const bookingFromDate = new Date(booking.from_date);  
    const bookingToDate = new Date(booking.to_date);
    if(fromDate <= bookingToDate && bookingFromDate >= fromDate){
      return false;
    }
  } 
  return true; 
}

export async function getAllHotels(){
  logging("Getting all hotels");
  const hotels = await Hotel.find();
  return hotels; 
}
// Get hotel by its ID, throw an error if not found
export async function getHotelDocumentById(hotelId: string)
{  
    try {
        const hotel = await Hotel.findById(hotelId);
        if(!hotel)
        {
            logging("couldn't find hotel"); 
            throw new Error('Error 001: Hotel not found');
        }
        return hotel;
    }
    catch (error) 
    {
        if (error instanceof Error) {
            logging(`Error retrieving hotel by ID: ${error.message}`);
        } else {
            logging(`An unexpected error occurred: ${error}`);
        }
        throw error; // re-throw the error if needed
    }
}
// Get hotel by its name, throw an error if not found
export async function getHotelDocumentByName(hotelName: string)
{   
    try {
        const hotel = await Hotel.findOne({ 'display.title': hotelName});
        if(!hotel)
        {
            throw new Error('Error 002: Hotel not found');
        }
        return hotel;
    }
    catch (error) 
    {
        if (error instanceof Error) {
            logging(`Error retrieving hotel by Name: ${error.message}`);
        } else {
            logging(`An unexpected error occured: ${error}`);
        }
        throw error; // re-throw the error if needed
    }
}
// Create a new hotel record
export async function createHotel(body: any){
  logging("Creating hotel"); 
  await Hotel.create(body); 
}


