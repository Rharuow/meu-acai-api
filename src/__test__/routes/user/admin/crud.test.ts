import {
  createAllKindOfUserAndRoles,
  createTwentyCreams,
} from "@/__test__/utils/beforeAll/Users";
import { userAsAdmin, userAsClient } from "@/__test__/utils/users";
import { app } from "@/app";
import { prismaClient } from "@/libs/prisma";
import { encodeSha256 } from "@libs/crypto";
import { Admin, Cream, Role, User } from "@prisma/client";
import { getUserByNameAndPassword } from "@repositories/user";
import request from "supertest";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let cream: Cream;

const userResourcePath = "/api/v1/resources/users";

const adminResourcePath = "/api/v1/resources/users/admins";

const createAdminBody = {
  name: "Test Admin Created",
  password: "123",
};

let userAdmin: User & { role?: Role } & { admin?: Admin };

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
        .set("authorization", `Bearer ${accessTokenAsAdmin}`)
        .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
        .expect(200);

      userAdmin = await getUserByNameAndPassword(
        {
          name: createAdminBody.name,
          password: createAdminBody.password,
        },
        ["Role", "Admin"]
      );

      console.log(userAdmin);

      expect(userAdmin).toBeTruthy();
      expect(userAdmin).toHaveProperty("name", createAdminBody.name);
      expect(
        userAdmin.id === response.body.data.user.admin.userId
      ).toBeTruthy();
      expect(userAdmin.name === response.body.data.user.name).toBeTruthy();
      expect(
        userAdmin.password === response.body.data.user.password
      ).toBeTruthy();
      expect(userAdmin).toHaveProperty(
        "password",
        encodeSha256(createAdminBody.password)
      );
      expect(userAdmin.role).toHaveProperty("name", "ADMIN");

      return expect(response.statusCode).toBe(200);
    }
  );

  // UPDATE
  test(
    "When an authenticated admin accesses PUT /api/v1/resources/users/:userId/admins/:id " +
      'with name "Test Admin Edited", ' +
      "then it should update the User with the new provided information",
    async () => {
      const response = await request(app)
        .put(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`)
        .send({ user: { name: "Test Admin Edited" } })
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      userAdmin = {
        ...userAdmin,
        name: "Test Admin Edited",
      };

      expect(response.body.data.user.name).toBe(userAdmin.name);
      expect(response.body.data.user.id).toBe(userAdmin.id);
      expect(
        response.body.data.user.admin.id === response.body.data.user.adminId
      ).toBeTruthy();
      expect(response.body.data.user.admin.id).toBe(userAdmin.admin.id);
      return expect(response.statusCode).toBe(200);
    }
  );

  // GET
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins/:id " +
      "with the ID of the first admin, " +
      "then it should return the first admin and associated user created",
    async () => {
      const response = await request(app)
        .get(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", refreshTokenAsAdmin)
        .expect(200);

      expect(response.body.data.user.name).toBe(userAdmin.name);
      expect(response.body.data.user.admin.id).toBe(userAdmin.admin.id);
      expect(response.body.data.user.roleId).toBe(userAdmin.roleId);
      return expect(response.statusCode).toBe(200);
    }
  );

  // LIST
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins " +
      "then it should return an array containing the first admin created and the default admin created",
    async () => {
      const response = await request(app)
        .get("/api/v1/resources/users/admins")
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      expect(response.body.data.length).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.hasNextPage).toBe(false);
      return expect(response.statusCode).toBe(200);
    }
  );

  // DELETE
  test(
    "When an authenticated admin accesses DELETE /api/v1/resources/users/admins/:id " +
      "then it should return a 204 status and delete the first admin created",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + `/${userAdmin.id}`)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", refreshTokenAsAdmin)
        .expect(204);

      return expect(response.statusCode).toBe(204);
    }
  );
});
