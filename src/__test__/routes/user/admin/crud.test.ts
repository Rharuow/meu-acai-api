import { createAllKindOfUserAndRoles } from "@/__test__/utils/beforeAll/Users";
import { userAsAdmin, userAsClient } from "@/__test__/utils/users";
import { app } from "@/app";
import { prismaClient } from "@libs/prisma";
import { encodeSha256 } from "@libs/crypto";
import { Admin, Role, User } from "@prisma/client";
import { getUserByNameAndPassword } from "@repositories/user";
import request from "supertest";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let admins: Array<User & { role?: Role } & { admin?: Admin }>;

const userResourcePath = "/api/v1/resources/users";

const adminResourcePath = "/api/v1/resources/users/admins";

const createAdminBody = {
  name: "Test Admin Created",
  password: "123",
};

const createAdminBodyMissingPassword = {
  name: "Test Admin Missing Parameters",
};

const createAdminBodyMissingName = {
  password: "Missing name",
};

const createManyAdmins = Array(15)
  .fill(null)
  .map((_, index) => ({
    name: `Test Many Admins ${index + 1}`,
    password: "123",
  }));

let userAdmin: User & { role?: Role } & { admin?: Admin };

beforeAll(async () => {
  await createAllKindOfUserAndRoles();
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
    "When an authenticated ADMIN accesses POST /api/v1/resources/users/admins " +
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

  test(
    "When an authenticated ADMIN accesses POST /api/v1/resources/users/admins " +
      "without body data" +
      "then it shouldn't create a new User and a new Admin resource in the database and return 422",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .set("authorization", `Bearer ${accessTokenAsAdmin}`)
        .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
        .expect(422);

      return expect(response.statusCode).toBe(422);
    }
  );

  test(
    "When an authenticated ADMIN accesses POST /api/v1/resources/users/admins " +
      "with body missing password " +
      "then it shouldn't create a new User and a new Admin resource in the database and return 422",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .send(createAdminBodyMissingPassword)
        .set("authorization", `Bearer ${accessTokenAsAdmin}`)
        .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
        .expect(422);

      return expect(response.statusCode).toBe(422);
    }
  );

  test(
    "When an authenticated ADMIN accesses POST /api/v1/resources/users/admins " +
      "with body missing name " +
      "then it shouldn't create a new User and a new Admin resource in the database and return 422",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .send(createAdminBodyMissingName)
        .set("authorization", `Bearer ${accessTokenAsAdmin}`)
        .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
        .expect(422);

      return expect(response.statusCode).toBe(422);
    }
  );

  test(
    "When accesses POST /api/v1/resources/users/admins WITHOUT authentication" +
      'with name "Test Admin Created" and password "123", ' +
      "then it shouldn't create a new User and a new Admin resource in the database and return 401",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .send(createAdminBody)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated CLIENT accesses POST /api/v1/resources/users/admins" +
      'with name "Test Admin Created" and password "123", ' +
      "then it shouldn't create a new User and a new Admin resource in the database and return 401",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .send(createAdminBody)
        .set("authorization", `Bearer ${accessTokenAsClient}`)
        .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated MEMBER accesses POST /api/v1/resources/users/admins" +
      'with name "Test Admin Created" and password "123", ' +
      "then it shouldn't create a new User and a new Admin resource in the database and return 401",
    async () => {
      const response = await request(app)
        .post(adminResourcePath)
        .send(createAdminBody)
        .set("authorization", `Bearer ${accessTokenAsMember}`)
        .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
        .expect(401);

      return expect(response.statusCode).toBe(401);
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
        .send({ name: "Test Admin Edited" })
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

  test(
    "When an authenticated admin accesses PUT /api/v1/resources/users/:userId/admins/:id " +
      "without body" +
      "then it shouldn't update the User with the new provided information and return 422",
    async () => {
      const response = await request(app)
        .put(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(400);

      return expect(response.statusCode).toBe(400);
    }
  );

  test(
    "When an authenticated CLIENT accesses PUT /api/v1/resources/users/:userId/admins/:id " +
      'with name "Test Admin Edited", ' +
      "then it shouldn't update the User with the new provided information and return 401",
    async () => {
      const response = await request(app)
        .put(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`)
        .send({ name: "Test Admin Edited" })
        .set("authorization", "Bearer " + accessTokenAsClient)
        .set("refreshToken", "Bearer " + refreshTokenAsClient)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When accesses PUT /api/v1/resources/users/:userId/admins/:id without authentication" +
      'with name "Test Admin Edited", ' +
      "then it shouldn't update the User with the new provided information and return 401",
    async () => {
      const response = await request(app)
        .put(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`)
        .send({ user: { name: "Test Admin Edited" } })
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated MEMBER accesses PUT /api/v1/resources/users/:userId/admins/:id " +
      'with name "Test Admin Edited", ' +
      "then it shouldn't update the User with the new provided information and return 401",
    async () => {
      const response = await request(app)
        .put(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`)
        .send({ name: "Test Admin Edited" })
        .set("authorization", "Bearer " + accessTokenAsMember)
        .set("refreshToken", "Bearer " + refreshTokenAsMember)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated ADMIN accesses PUT /api/v1/resources/users/:userId/admins/:id " +
      "with invalid params, " +
      "then it shouldn't update the User with the new provided information and return 401",
    async () => {
      const response = await request(app)
        .put(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`)
        .send({ invalid: { params: "Test Admin Edited" } })
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(422);

      return expect(response.statusCode).toBe(422);
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
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      expect(response.body.data.user.name).toBe(userAdmin.name);
      expect(response.body.data.user.admin.id).toBe(userAdmin.admin.id);
      expect(response.body.data.user.roleId).toBe(userAdmin.roleId);
      return expect(response.statusCode).toBe(200);
    }
  );

  test(
    "When an authenticated CLIENT accesses GET /api/v1/resources/users/admins/:id " +
      "with the ID of the first admin, " +
      "then it should return 401 status code",
    async () => {
      const response = await request(app)
        .get(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`)
        .set("authorization", "Bearer " + accessTokenAsClient)
        .set("refreshToken", "Bearer " + refreshTokenAsClient)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated MEMBER accesses GET /api/v1/resources/users/admins/:id " +
      "with the ID of the first admin, " +
      "then it should return 401 status code",
    async () => {
      const response = await request(app)
        .get(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`)
        .set("authorization", "Bearer " + accessTokenAsMember)
        .set("refreshToken", "Bearer " + refreshTokenAsMember)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When accesses GET /api/v1/resources/users/admins/:id without authentication" +
      "with the ID of the first admin, " +
      "then it should return 401 status code",
    async () => {
      const response = await request(app)
        .get(userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  // LIST
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/admins " +
      "then it should return an array containing the first admin created and the default admin created",
    async () => {
      const roleId = (
        await prismaClient.role.findUnique({
          where: {
            name: "ADMIN",
          },
          select: {
            id: true,
          },
        })
      ).id;

      await prismaClient.user.createMany({
        data: createManyAdmins.map((admin) => ({
          name: admin.name,
          password: admin.password,
          roleId,
        })),
      });

      const response = await request(app)
        .get("/api/v1/resources/users/admins")
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      expect(response.body.data.length).toBe(10);
      expect(response.body.page).toBe(1);
      expect(response.body.hasNextPage).toBe(true);
      return expect(response.statusCode).toBe(200);
    }
  );

  test(
    "When an authenticated CLIENT accesses GET /api/v1/resources/users/admins " +
      "then it should return 401 status code",
    async () => {
      const response = await request(app)
        .get("/api/v1/resources/users/admins")
        .set("authorization", "Bearer " + accessTokenAsClient)
        .set("refreshToken", "Bearer " + refreshTokenAsClient)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated MEMBER accesses GET /api/v1/resources/users/admins " +
      "then it should return 401 status code",
    async () => {
      const response = await request(app)
        .get("/api/v1/resources/users/admins")
        .set("authorization", "Bearer " + accessTokenAsMember)
        .set("refreshToken", "Bearer " + refreshTokenAsMember)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When accesses GET /api/v1/resources/users/admins without authentication " +
      "then it should return 401 status code",
    async () => {
      const response = await request(app)
        .get("/api/v1/resources/users/admins")
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  // DELETE
  test(
    "When an autenticated admin accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2" +
      "then it should return a 204 status and delete all the ids sent in query parameters",
    async () => {
      admins = await prismaClient.user.findMany({
        where: {
          name: {
            startsWith: "Test Many Admins ",
          },
        },
      });

      const response = await request(app)
        .delete(
          `${userResourcePath}/deleteMany?ids=${admins
            .map((admin) => admin.id)
            .join(",")}`
        )
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(204);

      return expect(response.statusCode).toBe(204);
    }
  );

  test(
    "When an autenticated CLIENT accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2" +
      "then it should return a 401 status code",
    async () => {
      const response = await request(app)
        .delete(
          `${userResourcePath}/deleteMany?ids=${admins
            .map((admin) => admin.id)
            .join(",")}`
        )
        .set("authorization", "Bearer " + accessTokenAsClient)
        .set("refreshToken", "Bearer " + refreshTokenAsClient)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an autenticated ADMIN accesses DELETE /api/v1/resources/users/deleteMany without ids query params" +
      "then it should return a 400 status code",
    async () => {
      const response = await request(app)
        .delete(`${userResourcePath}/deleteMany`)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(400);

      return expect(response.statusCode).toBe(400);
    }
  );

  test(
    "When an autenticated MEMBER accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2" +
      "then it should return a 401 status code",
    async () => {
      const response = await request(app)
        .delete(
          `${userResourcePath}/deleteMany?ids=${admins
            .map((admin) => admin.id)
            .join(",")}`
        )
        .set("authorization", "Bearer " + accessTokenAsMember)
        .set("refreshToken", "Bearer " + refreshTokenAsMember)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2 without authentication " +
      "then it should return a 401 status code",
    async () => {
      const response = await request(app)
        .delete(
          `${userResourcePath}/deleteMany?ids=${admins
            .map((admin) => admin.id)
            .join(",")}`
        )
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated admin accesses DELETE /api/v1/resources/users/admins/:id " +
      "then it should return a 204 status and delete the first admin created",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + `/${userAdmin.id}`)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(204);

      return expect(response.statusCode).toBe(204);
    }
  );

  test(
    "When an authenticated CLIENT accesses DELETE /api/v1/resources/users/admins/:id " +
      "then it should return a 401 status",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + `/${userAdmin.id}`)
        .set("authorization", "Bearer " + accessTokenAsClient)
        .set("refreshToken", "Bearer " + refreshTokenAsClient)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated MEMBER accesses DELETE /api/v1/resources/users/admins/:id " +
      "then it should return a 401 status",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + `/${userAdmin.id}`)
        .set("authorization", "Bearer " + accessTokenAsMember)
        .set("refreshToken", "Bearer " + refreshTokenAsMember)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated ADMIN accesses DELETE /api/v1/resources/users/admins/:id with id invalid" +
      "then it should return a 422 status",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + "/123")
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(422);

      return expect(response.statusCode).toBe(422);
    }
  );

  test(
    "When accesses DELETE /api/v1/resources/users/admins/:id without authentication " +
      "then it should return a 401 status",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + `/${userAdmin.id}`)
        .expect(401);

      return expect(response.statusCode).toBe(401);
    }
  );

  test(
    "When an authenticated admin accesses DELETE /api/v1/resources/users/admins " +
      "then it should return a 404 status",
    async () => {
      const response = await request(app)
        .delete(userResourcePath)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(404);

      return expect(response.statusCode).toBe(404);
    }
  );
});
