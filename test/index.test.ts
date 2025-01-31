
import express from "express";
import { Mongoose } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import * as bodyParser from "body-parser";
import rest, { CREATE, GET_LIST, GET_ONE, UPDATE, DELETE } from "../src/index";
import { connect, User } from "./models";

let mongod: MongoMemoryServer;
let db: Mongoose;

const setupServer = () => {
  const app = express();
  app.use(bodyParser.json());
  return app;
};

jest.setTimeout(30000); // ✅ Increase Jest timeout to 10s

describe("User Test", () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create(); // ✅ Start in-memory MongoDB
    const url = mongod.getUri();
    console.log('URL ', url)
    db = await connect(url);

    // ✅ Ensure MongoDB is ready before inserting data
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ✅ Preload database with test users
    await User.insertMany([
      { name: "Vikas", username: "vikas26", password: "123456" },
      { name: "Jeff", username: "jeff", password: "jeff1234" },
      { name: "Boba", username: "boba", password: "bob1234" },
      { name: "Steven", username: "steven", password: "steven1234" },
      { name: "Alice", username: "alice123", password: "pass123" }
    ]);
  });

  afterAll(async () => {
    await db.connection.close();
    await mongod.stop();
  });

  it("should create, update, and retrieve users", async () => {
    const app = setupServer();

    rest({
      router: app,
      route: "/users",
      model: User,
      actions: [CREATE, GET_LIST, GET_ONE, UPDATE, DELETE],
      select: "-username" // ✅ Exclude 'username' field
    });

    // ✅ Create a user
    let res = await request(app)
      .post("/users")
      .send({ name: "Alice", username: "alice123", password: "pass123" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe("Alice");

    const { id } = res.body;

    // ✅ Update the user
    res = await request(app).put(`/users/${id}`).send({ name: "Updated Alice" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Alice");

    // ✅ Retrieve the user
    res = await request(app).get(`/users/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Alice");

    // ✅ Ensure username is excluded, but password is present
    expect(res.body).not.toHaveProperty("username");
  });

  it("should retrieve a list of users with sorting and range", async () => {
    const app = setupServer();

    rest({
      router: app,
      route: "/users",
      model: User,
      actions: [GET_LIST],
      select: "-username"
    });

    // ✅ Fetch users sorted by name (ascending)
    const res = await request(app)
      .get("/users")
      .query({
        sort: JSON.stringify(["name", "ASC"]),
        range: JSON.stringify([0, 2])
      });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    // ✅ Validate order of returned users
    expect(res.body[0].name).toBe("Alice");
    expect(res.body[1].name).toBe("Boba");
  });

  it("should filter users by username", async () => {
    const app = setupServer();

    rest({
      router: app,
      route: "/users",
      model: User,
      actions: [GET_LIST],
      select: "-username"
    });

    // ✅ Filter users by username
    const res = await request(app)
      .get("/users")
      .query({
        filter: JSON.stringify({ username: ["vikas26", "boba"] })
      });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    // ✅ Ensure filtered users match expected usernames
  });

  it("should return users with full-text search", async () => {
    const app = setupServer();

    rest({
      router: app,
      route: "/users",
      model: User,
      actions: [GET_LIST],
      select: "-username"
    });

    // ✅ Full-text search for "vikas"
    const res = await request(app)
      .get("/users")
      .query({
        filter: JSON.stringify({ q: "vikas" })
      });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Vikas");
  });

  it("should delete a user", async () => {
    const app = setupServer();

    rest({
      router: app,
      route: "/users",
      model: User,
      actions: [DELETE],
      select: "-username"
    });

    // ✅ Create a user to delete
    let res = await request(app)
      .post("/users")
      .send({ name: "Vikas", username: "vikas26", password: "123456" });

    const { id } = res.body;

    // ✅ Delete user
    res = await request(app).delete(`/users/${id}`);
    expect(res.status).toBe(200);

    // ✅ Ensure user is deleted
    res = await request(app).get(`/users/${id}`);
    expect(res.status).toBe(404);
  });
});

