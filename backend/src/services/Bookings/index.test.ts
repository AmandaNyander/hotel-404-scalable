import { NextFunction } from "express";
import request from "supertest"
import MongoMemoryServer from "mongodb-memory-server-core"
import mongoose from "mongoose";
import app from "./index"

//För att testerna ska köras automastiskt
process.env.NODE_ENV = "test";
//För att skapa en mock DB att köra testerna på
jest.mock("./bookingRouter", () => {
    return(req: Request, res:Response, next: NextFunction) => {
        next();
    }
});
let mongoServer : MongoMemoryServer | null= null;


//Runs before all the tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {dbName: "testDB"});
})

//Test
describe("API Test", () => {
    //test som förväntas retunera code 200
    it("should return 200 for GET /", async () => {
        const res = await request(app).get("/");
        expect(res.statusCode).toBe(200);
    })
})

//Efter testerna, stäng kopplingen
afterAll(async () => {
    await mongoose.disconnect();
    if(mongoServer) {
        await mongoServer.stop();
    }
})


