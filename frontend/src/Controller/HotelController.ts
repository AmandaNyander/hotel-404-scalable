import {IHotelDetails} from "../Model/Hotel";
import axios from "axios"; 

const API_URL_ALL_HOTELS = process.env.REACT_APP_API_URL_ALL_HOTELS;
const API_URL_GET_HOTELS = process.env.REACT_APP_API_URL_GET_HOTELS;
const API_URL_HOTEL_DETAILS = process.env.REACT_APP_API_URL_HOTEL_DETAILS;

export async function getHotelInfo(){
  const hotels = await axios.get(`${API_URL_ALL_HOTELS}`);
  const formattedHotels = hotels.data.map((hotel: any) => {
    return {
      ...hotel.display,
      id: hotel._id,
      image: hotel.hotel_img?.url || "https://png.pngtree.com/png-vector/20190917/ourmid/pngtree-not-found-outline-icon-vectors-png-image_1737857.jpg"
    }; 
  }); 
  return formattedHotels; 
}


export async function getHotelQuery(params: any){
  const hotels = await axios.get(`${API_URL_GET_HOTELS}`, {params});
  const formattedHotels = hotels.data.map((hotel: any) => {
    return {
      ...hotel.display,
      id: hotel._id,
      image: hotel.hotel_img?.url || "https://png.pngtree.com/png-vector/20190917/ourmid/pngtree-not-found-outline-icon-vectors-png-image_1737857.jpg"
    }; 
  }); 
  return formattedHotels; 
}

export async function getHotelPage(id: string): Promise<IHotelDetails>{
  console.log(id); 
  const params = new URLSearchParams([['hotelId', id]]);
  const hotel = await axios.get(`${API_URL_HOTEL_DETAILS}`, {params});
  console.log(hotel.data); 
  return hotel.data; 
}
