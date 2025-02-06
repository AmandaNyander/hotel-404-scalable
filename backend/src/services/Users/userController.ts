import mongoose from "mongoose";
import { User } from "./User";
import { error } from "console";
//TODO: Delete bookings by calling booking API instead of calling database
//import { Booking } from "../Model/Booking";
import { logging } from "../../logging";

//function som hanterar login
export async function AuthLogin(username: string, password: string) {
    logging(`searching for username: ${username}`);
  try {
    const found = await User.findOne({ username: username, password: password })
    if (!found) {
      logging(`User not found: ${username}`);
      //If there is no sush a username
      throw new Error('User not found');
    }
    //Om den hittar ett doc där username och password stämmer så fås _id
    logging(`Found user: ${username}`);
    console.log(found._id)
    return found._id;
  }
  catch (error) {
    if (error instanceof Error) {
      console.error('Nånting', error.message)
    }
    else {
      console.error('annat', error)
    }
    throw error;
  }
}

//Funktion som kolla ifall det finns en annan användare med samma username
//Om det inte finns en match return true annars false
async function usernameCheck(username: string) {
  try {
    logging(`searching for username: ${username}`);
    const check = await User.findOne({ username: username })

    if (check) {
      //En match hittades
      return false;
    }
    //En match hittades inte
    return true;
  }
  catch (error) {
    console.error(error)
  }
}
//En funktion för att kolla ålder
//Om åldern är ok returnar den true 
function checkAge(age: number) {
  return age >= 18;
}

//Function för att hantera en ny användare
export async function newUser(name: string, lastname: string, username: string, age: number, password: string, isAdmin: boolean) {
  logging(`Creating user ${name}, ${lastname}, ${username}`);
  const firstCheck = await usernameCheck(username);
  const secondCheck = checkAge(age);
  if (!firstCheck) {
    logging(`User already exists: ${username}`);
    throw new Error('This username is taken');
  }
  else if (!secondCheck) {
    logging(`User is too young`);
    throw new Error('You are too young to make an account');
  }
  User.create({
    name: name,
    lastname: lastname,
    username: username,
    password: password,
    isAdmin: isAdmin,
    age: age
  })
  logging("User Successfully created!");
}

// Function to delete a user
export async function deleteUser(username: string) {
  logging(`Deleting user ${username}`);
  try {
    // Find the user, delete the users bookings and then delete the user
    const user = await User.findOne({ username: username });
    //TODO: call Booking service to delete all bookings belonging to the user
    //await Booking.deleteMany({ user: username });
    await User.deleteOne({ username: username });
  }
  catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting user by ID:', error.message);
    }
    else {
      console.error('An unexpected error occurred:', error);
    }

    throw error;
  }
}



