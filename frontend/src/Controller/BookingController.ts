import { IBooking } from "../Model/Booking";
import axios from "axios"; 

const API_URL = process.env.REACT_APP_API_URL_BOOKINGS;

export async function GetBookings() {
    //Kommer göra en API request sen men returnerar statisk data just nu
    const bookings = await axios.get(`${API_URL}`);
    console.log(bookings.data); 
    return bookings.data; 
}
//För att hantera "cancel booking"
export async function DeleteBooking(id: string){
  const deleted = await axios.delete(`${API_URL}`, {data: {bookingId: id}}); 
}
//Skapar en bokning med hotell detaljerna samt binder det till användaren som utför bokningen
export async function CreateBooking(
  hotelId: string,
  user: string,
  from_date:string,
  to_date: string){

  await axios.post(`${API_URL}`, {
    hotelID: hotelId,  
    user: user,
    from_date: from_date,
    to_date: to_date}); 
};  
