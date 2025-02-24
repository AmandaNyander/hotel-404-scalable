import createServer from "./server"
import MongoMemoryServer from "mongodb-memory-server-core"
import mongoose from "mongoose"
import { NextFunction } from "express"
import { User } from "./User"
import express from "express";
import request from 'supertest';
import supertest, { SuperTest, Test } from "supertest";

const app = createServer();

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "testDB" });
  User.create({
    name: "John",
    lastname: "Smith",
    username: "johnsmith",
    password: "1234",
    isAdmin: false,
    age: 21
  });
});


//Tests are currently not working despite API calls working fine through client
describe("login", () => {
  it("Should return 201 for POST /login", (done) => {
    const payload = { username: "johnsmith", password: "1234" };
    request(app).post("/login").send(payload).set('Accept', 'application/json').set('Content-Type', 'application/json').expect(201, done)

  });
})


describe("signup", () => {
  it("Should return 201 for POST /signup", (done) => {
    const payload = { username: "johnsmith2", password: "1234", name: "John", lastname: "Smith", age: 21, isAdmin: false };
    request(app).post("/signup").send(payload).set("Content-Type", "application/json").expect(201, done);
  })
})

/*describe("deleteUser", () => {
  it("Should return 204 for DELETE /delete", (done) => {
    const payload = {username: }
  })
})*/
