import { app } from "@/app";
import { User } from "@prisma/client";
import { verify } from "jsonwebtoken";
import request from "supertest";
import { userAsAdmin } from "../utils/users";
import { createAllKindOfUserAndRoles } from "../utils/beforeAll/Users";

let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
  await createAllKindOfUserAndRoles();
});

describe("Sign in route", () => {
  test("when access POST route '/api/v1/signin' contains in body the name and password correclty return in body the accessToken, refreshToken and the user", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send(userAsAdmin)
        .set("Accept", "application/json")
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name");
      expect(response.body.user).toHaveProperty("roleId");

      accessToken = response.body.token;
      refreshToken = response.body.refreshToken;

      verify(
        refreshToken,
        process.env.TOKEN_SECRET,
        (err: any, decoded: User) => {
          if (err) console.log("Token verification failed:", err.message);
          else {
            expect(decoded.name).toBe("Test Admin");
          }
        }
      );

      return verify(
        accessToken,
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
        .post("/api/v1/signin")
        .send({ ...userAsAdmin, unpermittedParam: true })
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
        .post("/api/v1/signin")
        .send({ name: "Missing password" })
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
        .post("/api/v1/signin?someParam=true")
        .send(userAsAdmin)
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

  test("when try to make signin with password or name invalid return 401", async () => {
    const responseWithNameWrong = await request(app)
      .post("/api/v1/signin")
      .send({ name: "wrong", password: userAsAdmin.password })
      .set("Accept", "application/json")
      .expect(401);

    const responseWithPasswordWrong = await request(app)
      .post("/api/v1/signin")
      .send({ name: userAsAdmin.name, password: "wrong" })
      .set("Accept", "application/json")
      .expect(401);

    expect(responseWithPasswordWrong.statusCode).toBe(401);

    return expect(responseWithNameWrong.statusCode).toBe(401);
  });
});
