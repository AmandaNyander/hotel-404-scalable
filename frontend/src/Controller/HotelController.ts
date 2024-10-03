import {IHotel} from "../Model/Hotel";
//import { hotels } from "../MocData/hotelCards"; 
import axios from "axios"; 


export async function getHotelInfo(){
  const hotels = await axios.get("http://localhost:7700/api/hotels/all");
  const formattedHotels = hotels.data.map((hotel: any) => {
    return {
      ...hotel.display,
      id: hotel._id
    }; 
  }); 
  return formattedHotels; 
}

export async function getHotelPage(id: string){
  console.log(id); 
  const params = new URLSearchParams([['hotelId', id]]);
  const hotel = await axios.get("http://localhost:7700/api/hotels/hotelDetails", {params});
  return hotel.data; 
}
