import { Booking } from "./Booking";
import { Hotel } from "../Hotels/Hotel";
import { logging } from "../../logging";
import { log } from "console";

// Function to delete a booking by its ID
export async function deleteBooking(bookingId: string) {
  try {
    logging("Deleting booking: " + bookingId);
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      logging(`Unable to find a booking with ID: ${bookingId}`);
      throw new Error("Error 001: Booking not found");
    }
  } catch (error) {
    if (error instanceof Error) {
      logging("Database error when retrieving booking");
      console.error("Error retrieving booking by ID:", error.message);
    } else {
      logging(("An unexpected error occured: " + error) as string);
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
}
// Function to create a new booking
export async function createBooking(
  hotelID: string,
  user: string,
  from_date: string,
  to_date: string
) {
  logging(`Creating booking for user ${user} for hotel ${hotelID}`);
  let date1 = new Date(from_date);
  let date2 = new Date(to_date);
  let days = Math.round(
    (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
  );
  let hotel = await Hotel.findById(hotelID);
  const timeNow = Date.now();

  const checkInDate = date1.toISOString().split("T")[0];
  const checkOutDate = date2.toISOString().split("T")[0];
  //If checkout date is less than checkin date, throw an error
  //Also throw an error if either date is before the current time
  if (days < 0) {
    logging(
      `You can not check in before you check out. Check-in: ${checkInDate}, check-out: ${checkOutDate}`
    );
    throw new Error("invalid dates");
  } else if (Number(date1) < timeNow || Number(date2) < timeNow) {
    logging(`Check in date is in the past, Check-in: ${checkInDate}.`);
    throw new Error("invalid dates");
  }
  if (!hotel) {
    logging(`Couldn't find hotel with hotelID: ${hotelID}`);
    throw new Error("couldn't find hotel");
  }
  const cost = hotel.display?.price;
  if (!cost) {
    logging(
      `Couldn't find a price for the hotel with the following hotelID: ${hotelID}`
    );
    throw new Error("Couldn't get hotel price");
  }
  const calculatedCost = cost * days;
  await Booking.create({
    hotel: hotelID,
    user: user,
    from_date: checkInDate,
    to_date: checkOutDate,
    cost: calculatedCost,
  });

  logging(
    `Bookiing created for user: ${user}, at hotel: ${hotelID}, from: ${checkInDate} to: ${checkOutDate} with the total cost: ${calculatedCost}`
  );
}
// Function to retrieve bookings for a specific user
export async function getBookingForUser(username: string) {
  logging(`Getting bookings for ${username}` || username);
  try {
    const bookings = await Booking.find({ user: username });

    if (bookings.length === 0) {
      logging(`The user:${username} has no bookings`);
    } else {
      logging(`Found ${bookings.length} bookings for user: ${username}`);
    }
    var formattedBookings = [];

    //Kolla genom bokningarna
    for (let booking of bookings) {
      logging(`Handling booking: ${booking._id} for user: ${username}`);
      const hotel = await Hotel.findById(booking.hotel);

      if (!hotel) {
        logging(
          `Hotel with hotelID: ${booking.hotel} was not found for bookingID: ${booking._id}`
        );
        continue; //för att säga till programmet att fortsätta till nästa bokningen i listan
      }

      logging(
        `In Booking with bookingID: ${booking._id} was hotel: ${hotel.display?.title}, found!`
      );

      const formattedBooking = {
        id: booking._id,
        hotel: hotel?.display?.title,
        user: booking.user,
        to_date: booking.to_date.split("T")[0],
        from_date: booking.from_date.split("T")[0],
        cost: booking.cost,
      };

      formattedBookings.push(formattedBooking);

      logging(
        `Done with formating booking with ID: ${booking._id} for user:${username}`
      );
    }

    logging(
      `Returning a list with ${formattedBookings.length} formatted bookings for ${username}`
    );

    return formattedBookings;
  } catch (error) {
    logging(
      `Error: ${error}, occured while fetching bookings for user: ${username}`
    );
    console.error(error);
    throw error;
  }
}
