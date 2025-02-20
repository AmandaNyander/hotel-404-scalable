import app from "./index"
import request from "supertest"
import MongoMemoryServer from "mongodb-memory-server-core"
import mongoose from "mongoose"
import { Request, Response, NextFunction } from "express";

process.env.NODE_ENV = "test";

jest.mock("./hotelRouter", () => {
    return (req: Request, res: Response, next: NextFunction) => { // Simple mock function
      next(); // Just call next() to simulate passing through
    };
  });

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {dbName: "testDB"});
})

afterAll(async () => {
    if (mongoServer) {
        await mongoose.disconnect();
        await mongoServer.stop();
    }
})

describe("API tests", () => {
    it("should return 200 for GET /", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
    })
})