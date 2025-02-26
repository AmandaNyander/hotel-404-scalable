import { NextFunction, Request,Response } from "express";
import request from "supertest"
import MongoMemoryServer from "mongodb-memory-server-core"
import mongoose from "mongoose";
import {deleteBooking, createBooking,getBookingForUser} from './bookingController';
import { Booking } from "./Booking";
import { Hotel } from "../Hotels/Hotel";
import { logging } from "../../logging";
import exp from "constants";
import { createCipheriv } from "crypto";
import { hotelFreeBetweenDates } from "../Hotels/hotelController";

//Fixar miljön för testerna
process.env.NODE_ENV = "test";

let mongoServer : MongoMemoryServer | null= null;

//Ska köras innan all testerna
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {dbName:"TestDB"});
});
//För att rensa all logging innan varje test
beforeEach(async () => {
    jest.clearAllMocks();
})

//Tömma variabler efter varje test
afterEach(async() => {
    await mongoose.connection.db?.dropDatabase();
})

//Stäng ner allting efter att testerna är klara 
afterAll(async() => {
    await mongoose.disconnect();
    if(mongoServer) 
    {
        await mongoServer.stop();
    }
})

//Mock av logging funktionen 
jest.mock("../../logging",  () => ({
    logging: jest.fn()
}))

//Mock av Hotel Model
jest.mock("../Hotels/Hotel", () => ({
    Hotel: {
        findById: jest.fn()
    },
}))

//Mock av Booking Model
jest.mock("./Booking", () => ({
    Booking: {
        findById:jest.fn(),
        findByIdAndDelete:jest.fn(),
        create: jest.fn(),
        find:jest.fn()
    },
}))


//Skapar Huvud testen som innehåller alla testerna som har med Booking Service att göra
describe("Booking Service Tests", () => {
    
    //Skapar en mock DB för testerna
    let MOCKDB_MT: any[];

    //Ser till att den är tom innan varje test
    beforeEach(() => {
        MOCKDB_MT= [];
    });
    //Test för att skapa en Bokning
    describe("Create Booking", () => { 
        //Test case 1, Att skapa en bokning med rätt information
        it("Should create a new booking success", async () => {
            const hotelID = "hotel123";
            const user = "user123";
            const from_date= "2025-04-01";
            const to_date ="2025-05-01";
            const Mockhotel = {display : {price:1}};
            const Mockcost = 30;
            
            Hotel.findById = jest.fn().mockResolvedValue(Mockhotel);
            
            Booking.create = jest.fn().mockImplementation((booking) => {
                MOCKDB_MT.push(booking); //Lägger till en bokning i MOCK DB
            });

            //Ser till att DB är tom innan vi sätter igång 
            expect(MOCKDB_MT.length).toBe(0);

            //Testar att skapa en den bokningen
            await createBooking(hotelID,user,from_date,to_date);
            //ska testa om hotellet hittas
            expect(Hotel.findById).toHaveBeenCalledWith(hotelID);
            
            //Dubbel kollar att en ny bokning har lagts till
            expect(MOCKDB_MT.length).toBe(1);

            //Kontrollerar att den nya bokningen har alla rätta uppgifterna 
            expect(MOCKDB_MT[0]).toEqual({
                hotel:hotelID,
                user:user,
                from_date:"2025-04-01",
                to_date:"2025-05-01",
                cost:Mockcost,
            });

            expect(logging).toHaveBeenCalledWith(`Creating booking for user ${user} for hotel ${hotelID}`);
            
        })
        //Testar att boka ett hotel som inte ens finns
        it("Should throw an error for not finding the hotel", async () => {
            const hotelID = "hotel123";
            const user = "user123";
            const from_date= "2025-04-01";
            const to_date ="2025-05-01";
            Hotel.findById= jest.fn().mockResolvedValue(null)

            await expect(createBooking(hotelID,user,from_date,to_date)).rejects.toThrow("couldn't find hotel")
        })

        //Testar att boka med ogiltiga datum
        it("Should throw an error for invalid dates", async () => {
            const hotelID = "hotel123";
            const user = "user123";
            //to date is before from date
            const to_date= "2025-04-01";
            const from_date ="2025-05-01";
            
            const error = createBooking(hotelID,user, from_date,to_date);

            await expect(error).rejects.toThrow("invalid dates")
        })

        //Testar om man gör en bokning för samma dag att check in och lämna 
        it("Should throw an error for invalid dates, to short period", async () => {
            const hotelID = "hotel123";
            const user = "user123";
            const from_date= "2025-04-05";
            const to_date ="2025-04-01";
            const Mockhotel = {display : {price:1}};
            Hotel.findById = jest.fn().mockResolvedValue(Mockhotel);

            const error = createBooking(hotelID, user, from_date,to_date);
            await expect(error).rejects.toThrow("invalid dates")
        })
    })

    //Test för att ta bort bokningar
    describe("Delete Booking", () => {
        //Tar bort en bokning utan problem
        it("Should delete a booking without any problem", async () => {
            //Definerar en mockDB i from av Array
            let MOCKDB = [
                {id: "testBooking", hotel:"hotelEveryWhere", user:"Adam", from_date:"2025-04-01", to_date:"2025-04-10", cost:1000},
                {id: "testBooking2", hotel:"hotelNoWhere", user:"Max", from_date:"2025-04-20", to_date:"2025-04-25", cost: 2000}
            ];

            //Bokning som testet ska försöka ta bort
            const tempBookingID = "testBooking";
            //Kontrollerar att alla bokningar fortfarande finns med 
            expect(MOCKDB.length).toBe(2);

            //Kontrollerar att bokningen som vi ska testa på finns med
            expect(MOCKDB.find(booking => booking.id === tempBookingID)).toBeDefined()

            //Anropar deleteBooking funktionen för att ta bort bokningen
            await deleteBooking(tempBookingID);

            //Dubbel kollar att bokningen faktiskt har tagits bort
            expect(MOCKDB.length).toBe(1);//Endast en bokning kvar
            expect(MOCKDB.find(booking=> booking.id ===tempBookingID)).toBeUndefined(); //Kontrollerar att ID för den bokningen inte längre finns med

            expect(logging).toHaveBeenCalledWith(`Deleting booking: ${tempBookingID}`);

        });

        //Lyckas inte, bokningen finns inte
        it("Should throw error, booking not found", async () => {
            const tempBookingID= "TestBooking";
            Booking.findByIdAndDelete= jest.fn().mockResolvedValue(null);
            const res = deleteBooking(tempBookingID)
            await expect(res).rejects.toThrow("Error 001: Booking not found");
            expect(logging).toHaveBeenCalledWith(`Deleting booking: ${tempBookingID}`);
        })

        //Error på DB
        it("Should log an error if DB error occurs", async () => {
            const tempBookingID= "TestBooking1";
            const DB_Error= new Error("DB error");
            Booking.findByIdAndDelete = jest.fn().mockRejectedValue(DB_Error);

            await expect(deleteBooking(tempBookingID)).rejects.toThrow(DB_Error);
            expect(logging).toHaveBeenCalledWith("Database error when retrieving booking");
        });
    });

    //Test för att ta fram alla bokningar som en användare har
    describe("Get All bookings for a user", ()=> {

        //Tar fram alla bokningar utan problem
        it("Should retrieve booking for the user", async () => {
            const test_username = "Adam99";
            const test_Bookings= [
                { _id: "1234", hotel:"hotel1", user: test_username, from_date:"2025-04-01", to_date: "2025-04-04", cost: 1000},
               ];

            const test_hotel= {display: {title: "Hotel Everywhere"}};
            Hotel.findById = jest.fn().mockResolvedValue(test_hotel);
            Booking.find = jest.fn().mockResolvedValue(test_Bookings);

            const res = await getBookingForUser(test_username);

            expect(Booking.find).toHaveBeenCalledWith({user:test_username});
            expect(Hotel.findById).toHaveBeenCalledWith(test_Bookings[0].hotel);
            expect(res).toEqual([
                {
                    id: expect.any(String), // booking.id
                    hotel: "Hotel Everywhere",
                    user:test_username,
                    from_date: "2025-04-01",
                    to_date:"2025-04-04",
                    cost: 1000

                }
            ])
        })
    })
})
