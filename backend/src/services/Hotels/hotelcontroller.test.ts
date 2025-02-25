import request from "supertest"
import MongoMemoryServer from "mongodb-memory-server-core"
import mongoose from "mongoose"
import { Request, Response, NextFunction } from "express";
import { Booking } from "../Bookings/Booking"; 
import { Hotel } from "./Hotel"; 
import { logging } from "../../logging";
import { createHotel, getHotelDocumentById, getHotelDocumentByName } from "./hotelController";

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

describe("Find hotel tests", () => {
    it("Should find hotel document by ID", async () => {
        const hotelID = "hotel123";
        const mockHotelData = {id: hotelID, title: "Hotellet", city: "Jönköping", price: 50};

        (Hotel.findById as jest.Mock).mockResolvedValue(mockHotelData);

        const result = await getHotelDocumentById(hotelID);

        expect(result).toEqual(mockHotelData);
        expect(Hotel.findById).toHaveBeenCalledWith(hotelID);
    })


    it("Should find hotel document by name", async () => {
        const hotelName = "Hotellet";
        const mockHotelData = {display:{ title: hotelName }, city: "Jönköping", price: 50};

        (Hotel.findOne as jest.Mock).mockResolvedValue(mockHotelData);

        const result = await getHotelDocumentByName(hotelName);

        expect(result).toEqual(mockHotelData);
        expect(Hotel.findOne).toHaveBeenCalledWith({ 'display.title': hotelName });
    })
})

