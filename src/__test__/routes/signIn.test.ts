import { app } from "@/app";
import { User } from "@prisma/client";
import { verify } from "jsonwebtoken";
import request from "supertest";

const requestBody = {
  username: "Test Admin",
  password: "123",
};

let token: string;

describe("Sign in route", () => {
  test("when access POST route '/api/v1/signgin' contains in body the username and password correclty return in body the token and the user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signgin")
        .send(requestBody)
        .set("Accept", "application/json")
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name");
      expect(response.body.user).toHaveProperty("roleId");

      token = response.body.token;

      return verify(
        token,
        process.env.TOKEN_SECRET,
        (err: any, decoded: User) => {
          if (err) console.log("Token verification failed:", err.message);
          else {
            expect(decoded.name).toBe("Test Admin");
          }
        }
      );
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  });

  test("when send unpermitted params in body, return 422", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signgin")
        .send({ ...requestBody, unpermittedParam: true })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("errors");

      expect(response.body.errors.length).toBeGreaterThan(0);

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  });

  test("when send missing params in body, return 422", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signgin")
        .send({ username: "Missing password" })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("errors");

      expect(response.body.errors.length).toBeGreaterThan(0);

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  });

  test("when send query params, return 422", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signgin?someParam=true")
        .send(requestBody)
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("errors");

      expect(response.body.errors.length).toBeGreaterThan(0);

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  });
});
