import {
  createAllKindOfUserAndRoles,
  createTwentyCreams,
} from "@/__test__/utils/beforeAll/Users";
import { userAsAdmin, userAsClient } from "@/__test__/utils/users";
import { app } from "@/app";
import { encodeSha256 } from "@libs/crypto";
import { Cream } from "@prisma/client";
import { getUser } from "@repositories/user";
import request from "supertest";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let cream: Cream;

beforeAll(async () => {
  await createAllKindOfUserAndRoles();
  await createTwentyCreams();
  const responseSignInAsAdmin = await request(app)
    .post("/api/v1/signin")
    .send(userAsAdmin)
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsClient = await request(app)
    .post("/api/v1/signin")
    .send(userAsClient)
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsMember = await request(app)
    .post("/api/v1/signin")
    .send(userAsClient)
    .set("Accept", "application/json")
    .expect(200);

  accessTokenAsAdmin = responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = responseSignInAsMember.body.refreshToken;
});

const adminResourcePath = "/api/v1/resources/users/admins";

const createAdminBody = {
  name: "Test Admin Created",
  password: "123",
};

describe("CRUD TO ADMIN RESOURCE", () => {
  // CREATE
  test(
    "When an authenticated admin accesses POST /api/v1/resources/users/admins " +
      'with name "Test Admin Created" and password "123", ' +
      "then it should create a new User and a new Admin resource in the database",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .send(createAdminBody)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .set("authorizarion", "Bearer " + accessTokenAsAdmin)
        .expect(200);

      const user = await getUser({
        username: createAdminBody.name,
        password: createAdminBody.password,
      });

      expect(user).toBeTruthy();
      expect(user).toHaveProperty("name", createAdminBody.name);
      expect(user).toHaveProperty(
        "password",
        encodeSha256(createAdminBody.password)
      );
      expect(user.role).toHaveProperty("name", "ADMIN");

      return expect(response.statusCode).toBe(200);
    }
  );

  // UPDATE
  test(
    "When an authenticated admin accesses PUT /api/v1/resources/users/admins/:id " +
      'with name "Test Admin Edited", ' +
      "then it should update the User with the new provided information",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // GET
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins/:id " +
      "with the ID of the first admin, " +
      "then it should return the first admin and associated user created",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // LIST
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins " +
      "then it should return an array containing the first admin created",
    async () => {
      return expect(false).toBeTruthy();
    }
  );

  // DELETE
  test(
    "When an authenticated admin accesses DELETE /api/v1/resources/users/admins/:id " +
      "then it should return a 204 status and delete the first admin created",
    async () => {
      return expect(false).toBeTruthy();
    }
  );
});
