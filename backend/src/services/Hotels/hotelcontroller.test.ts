import request from "supertest"
import MongoMemoryServer from "mongodb-memory-server-core"
import mongoose from "mongoose"
import { Request, Response, NextFunction } from "express";
import { Booking } from "../Bookings/Booking"; 
import { Hotel } from "./Hotel"; 
import { logging } from "../../logging";
import { createHotel, getAllHotels, getHotelDocumentById, getHotelDocumentByName, getHotels, hotelFreeBetweenDates } from "./hotelController";
import * as hotelController from "./hotelController";

process.env.NODE_ENV = "test";

jest.mock("./Hotel", () => ({
    Hotel: {
        find: jest.fn(),
        findById: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
    }
}))

jest.mock("../Bookings/Booking", () => ({
    Booking: {
        find: jest.fn()
    }
}))

jest.mock("../../logging", () => ({
    logging: jest.fn()
}))

let mongoServer: MongoMemoryServer | null = null

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {dbName: "testDB"});
})

beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
})

afterEach(async() => {
    await mongoose.connection.db?.dropDatabase();
})

afterAll(async () => {
    if (mongoServer) {
        await mongoose.disconnect();
        await mongoServer.stop();
    }
})

describe("Create hotel test", () => {
    it("Should create a hotel", async () => {
        const hotelID = "hotel123";
        const mockHotelData = {id: hotelID, title: "Hotellet", city: "Jönköping", price: 50};
        
        await createHotel(mockHotelData);

        expect(Hotel.create).toHaveBeenCalledWith(mockHotelData);
        expect(logging).toHaveBeenCalledWith("Creating hotel");

        (Hotel.findById as jest.Mock).mockResolvedValue(mockHotelData);

        const result = await getHotelDocumentById(hotelID);
        expect(result).toEqual(mockHotelData);
        expect(Hotel.findById).toHaveBeenCalledWith(hotelID);
    })
})

describe("Find hotel tests by id", () => {
    it("Should find hotel document by ID", async () => {
        const hotelID = "hotel123";
        const mockHotelData = {id: hotelID, title: "Hotellet", city: "Jönköping", price: 50};

        (Hotel.findById as jest.Mock).mockResolvedValue(mockHotelData);

        const result = await getHotelDocumentById(hotelID);

        expect(result).toEqual(mockHotelData);
        expect(Hotel.findById).toHaveBeenCalledWith(hotelID);
    })

    it("Should throw an error if hotel is not found", async () => {
        const hotelID = "nonexciting";

        (Hotel.findById as jest.Mock).mockResolvedValue(null);

        await expect(getHotelDocumentById(hotelID)).rejects.toThrow("Error 001: Hotel not found");
        expect(logging).toHaveBeenCalledWith("couldn't find hotel");
    })

    it("Should throw an error if database error occurs", async () => {
        const hotelID = "hotel123";
        const mockError = new Error("Database error");

        (Hotel.findById as jest.Mock).mockRejectedValue(mockError);

        await expect(getHotelDocumentById(hotelID)).rejects.toThrow("Database error");
        expect(logging).toHaveBeenCalledWith("Error retrieving hotel by ID: Database error");
    })

})

describe("Find hotel by name tests", () => {
    it("Should find hotel document by name", async () => {
        const hotelName = "Hotellet";
        const mockHotelData = {display:{ title: hotelName }, city: "Jönköping", price: 50};

        (Hotel.findOne as jest.Mock).mockResolvedValue(mockHotelData);

        const result = await getHotelDocumentByName(hotelName);

        expect(result).toEqual(mockHotelData);
        expect(Hotel.findOne).toHaveBeenCalledWith({ 'display.title': hotelName });
    })

    it("Should throw an error if hotel is not found", async () => {
        const hotelName = "nonexciting";

        (Hotel.findOne as jest.Mock).mockResolvedValue(null);

        await expect(getHotelDocumentByName(hotelName)).rejects.toThrow("Error 002: Hotel not found");
        expect(logging).toHaveBeenCalledWith("Error retrieving hotel by Name: Error 002: Hotel not found");
    })

    it("Should throw an error if database error occurs", async () => {
        const hotelName = "Hotellet";
        const mockError = new Error("Database error");

        (Hotel.findOne as jest.Mock).mockRejectedValue(mockError);

        await expect(getHotelDocumentByName(hotelName)).rejects.toThrow(mockError);
        expect(logging).toHaveBeenCalledWith("Error retrieving hotel by Name: Database error");
    })
})

describe("Get all hotels test", () => {
    it("Should return all hotels", async () => {
        const mockHotels = [
            { display: { title: "Hotellet"}, city: "Staden"},
            { display: { title: "Det andra hotellet"}, city: "Samma stad"}
        ];

        (Hotel.find as jest.Mock).mockResolvedValue(mockHotels);

        const result = await getAllHotels();

        expect(result).toEqual(mockHotels);
        expect(logging).toHaveBeenCalledWith("Getting all hotels");
    })

    it("Should return empty array when no hotels are found", async () => {
        (Hotel.find as jest.Mock).mockResolvedValue([]);

        const result = await getAllHotels();

        expect(result).toEqual([]);
        expect(logging).toHaveBeenCalledWith("Getting all hotels");
    })
})

describe("Hotel free between dates tests", () => {
    it("Should return true if hotel is availible", async () => {
        const mockHotel = { _id: "hotel123"};
        const mockfrom_date = new Date("2025-04-01");
        const mockto_date = new Date("2025-04-10");

        (Booking.find as jest.Mock).mockResolvedValue([]);

        const result = await hotelFreeBetweenDates(mockHotel, mockfrom_date, mockto_date);

        expect(Booking.find).toHaveBeenCalledWith({hotel: "hotel123"});
        expect(result).toBe(true);
    })

    it("Should return false if hotel is booked given dates", async () => {
        const mockHotel = { _id: "hotel123"};
        const mockfrom_date = new Date("2025-04-01");
        const mockto_date = new Date("2025-04-10");
        const mockBooking = [{from_date: "2025-04-02", to_date: "2025-04-12"}];

        (Booking.find as jest.Mock).mockResolvedValue(mockBooking);

        const result = await hotelFreeBetweenDates(mockHotel, mockfrom_date, mockto_date);

        expect(result).toBe(false);
    })

    it("Should return true if hotel is booked but not given dates", async () => {
        const mockHotel = { _id: "hotel123"};
        const mockfrom_date = new Date("2025-04-01");
        const mockto_date = new Date("2025-04-05");
        const mockBooking = [{from_date: "2025-04-10", to_date: "2025-04-15"}];

        (Booking.find as jest.Mock).mockResolvedValue(mockBooking);

        const result = await hotelFreeBetweenDates(mockHotel, mockfrom_date, mockto_date);

        expect(result).toBe(true);
    })
})

describe("Get hotels test", () => {

    it("Should return availible hotels when searching for a city", async () => {
        const mockHotels = [
            {_id: "hotel1", display: {city: "Staden"}},
            {_id: "hotel2", display: {city: "Staden"}}
        ];
        const mockfrom_date = "2025-04-01";
        const mockto_date = "2025-04-05";

        (Hotel.find as jest.Mock).mockResolvedValue(mockHotels);
        jest.spyOn(hotelController, "hotelFreeBetweenDates").mockResolvedValue(true);

        const result = await getHotels("Staden", mockfrom_date, mockto_date);

        expect(Hotel.find).toHaveBeenCalledWith({"display.city": "Staden"});
        expect(result.every(hotel => hotel.display?.city === "Staden")).toBe(true);
        expect(logging).toHaveBeenCalledWith("Searching for hotels in city Staden between 2025-04-01 and 2025-04-05");
    })

    it("Should return availble hotels when not searching for a city", async () => {
        const mockHotels = [
            {_id: "hotel3", display: {city: "Staden"}},
            {_id: "hotel4", display: {city: "Den andra staden"}}
        ];
        const mockfrom_date = "2025-04-01";
        const mockto_date = "2025-04-05";

        (Hotel.find as jest.Mock).mockResolvedValue(mockHotels);
        jest.spyOn(hotelController, "hotelFreeBetweenDates").mockResolvedValue(true);

        const result = await getHotels(null, mockfrom_date, mockto_date);

        expect(result).toEqual(mockHotels);
        expect(logging).toHaveBeenCalledWith("Searching for hotels  between 2025-04-01 and 2025-04-05");
    })
})

describe("Get hotels when one hotel is not availible test", () => { 
    it("Should only return free hotels (hotel6 is booked)", async () => {
        const mockHotels = [
            {_id: "hotel5", display: {city: "Staden"}},
            {_id: "hotel6", display: {city: "Staden"}}
        ];
        const mockfrom_date = "2025-04-01";
        const mockto_date = "2025-04-05";
        const mockBooking = [{hotel: "hotel6", from_date: "2025-04-01", to_date: "2025-04-05"}];

        (Hotel.find as jest.Mock).mockResolvedValue(mockHotels);
        (Booking.find as jest.Mock).mockImplementation(async (query) => {
            return mockBooking.filter((b) => b.hotel === query.hotel);
        });

        const result = await getHotels("Staden", mockfrom_date, mockto_date);

        expect(result).toEqual([{_id: "hotel5", display: {city: "Staden"}}]);
    })
})
