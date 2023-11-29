import {
  createAllKindOfUserAndRoles,
  createTwentyCreams,
} from "@/__test__/utils/beforeAll/Users";
import { userAsAdmin, userAsClient } from "@/__test__/utils/users";
import { app } from "@/app";
import { prismaClient } from "@libs/prisma";
import { encodeSha256 } from "@libs/crypto";
import { Client, Role, User } from "@prisma/client";
import { getUserByNameAndPassword } from "@repositories/user";
import request from "supertest";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let clients: Array<User & { role?: Role } & { clients?: Client }>;

const userResourcePath = "/api/v1/resources/users";

const clientResourcePath = "/api/v1/resources/users/clients";

const createClientBody = {
  name: "Test Client Created",
  password: "123",
  address: {
    square: "2",
    house: "2",
  },
};

const updateClientBody = {
  name: "Test Client Edited",
  email: "test.client@mail.com",
  phone: "(84)999999999",
};

const createClientBodyMissingPassword = {
  name: "Test Client Missing Parameters",
};

const createClientBodyMissingName = {
  password: "Missing name",
};

const createManyClients = Array(15)
  .fill(null)
  .map((_, index) => ({
    name: `Test Client ${index + 1}`,
    password: "123",
    address: {
      square: (index + 3).toString(),
      house: (index + 3).toString(),
    },
  }));

const createManyClientsMissingPassword = Array(15)
  .fill(null)
  .map((_, index) => ({ name: `Test Client Missing ${index + 1}` }));

const createManyClientsMissingName = Array(15)
  .fill(null)
  .map((_, index) => ({ password: `missing name ${index + 1}` }));

let userClient: User & { role?: Role } & { client?: Client };

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

describe("CRUD TO CLIENT RESOURCE", () => {
  // CREATE
  test(
    "When an authenticated ADMIN accesses POST /api/v1/resources/users/client " +
      'with name "Test Client Created", password "123", square "number", number "number" ' +
      "then it should create a new User and a new Client resource in the database",
    async () => {
      const response = await request(app)
        .post(clientResourcePath)
        .send(createClientBody)
        .set("authorization", `Bearer ${accessTokenAsAdmin}`)
        .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
        .expect(200);

      userClient = await getUserByNameAndPassword(
        {
          name: createClientBody.name,
          password: createClientBody.password,
        },
        ["Role", "Client"]
      );

      expect(userClient).toBeTruthy();
      expect(userClient).toHaveProperty("name", createClientBody.name);
      expect(
        userClient.id === response.body.data.user.client.userId
      ).toBeTruthy();
      expect(userClient.name === response.body.data.user.name).toBeTruthy();
      expect(
        userClient.password === response.body.data.user.password
      ).toBeTruthy();
      expect(userClient).toHaveProperty(
        "password",
        encodeSha256(createClientBody.password)
      );
      expect(userClient.role).toHaveProperty("name", "CLIENT");

      return expect(response.statusCode).toBe(200);
    }
  );

  // test(
  //   "When an authenticated ADMIN accesses POST /api/v1/resources/users/clients " +
  //     "without body data" +
  //     "then it shouldn't create a new User and a new Client resource in the database and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath)
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses POST /api/v1/resources/users/clients " +
  //     "with body missing password " +
  //     "then it shouldn't create a new User and a new Client resource in the database and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath)
  //       .send(createClientBodyMissingPassword)
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses POST /api/v1/resources/users/clients " +
  //     "with body missing name " +
  //     "then it shouldn't create a new User and a new Client resource in the database and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath)
  //       .send(createClientBodyMissingName)
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When accesses POST /api/v1/resources/users/clients WITHOUT authentication" +
  //     'with name "Test Client Created" and password "123", ' +
  //     "then it shouldn't create a new User and a new Client resource in the database and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath)
  //       .send(createClientBody)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated CLIENT accesses POST /api/v1/resources/users/clients" +
  //     'with name "Test Client Created" and password "123", ' +
  //     "then it shouldn't create a new User and a new Client resource in the database and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath)
  //       .send(createClientBody)
  //       .set("authorization", `Bearer ${accessTokenAsClient}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated MEMBER accesses POST /api/v1/resources/users/clients" +
  //     'with name "Test Client Created" and password "123", ' +
  //     "then it shouldn't create a new User and a new Client resource in the database and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath)
  //       .send(createClientBody)
  //       .set("authorization", `Bearer ${accessTokenAsMember}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated CLIENT accesses POST /api/v1/resources/users/clients/createMany" +
  //     "send in body a array with name and password valid to create many clients" +
  //     "then it should create many CLIENTs and USERs resources in the database",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .send(createManyClients)
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(204);

  //     clients = await prismaClient.user.findMany({
  //       include: {
  //         client: true,
  //         role: true,
  //       },
  //       where: {
  //         name: {
  //           in: createManyClients.map((clt) => clt.name),
  //         },
  //       },
  //     });

  //     expect(clients.length).toBe(15);
  //     return expect(response.statusCode).toBe(204);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses POST /api/v1/resources/users/clients/createMany" +
  //     "send in body a array with name valid to create many clients but missing password" +
  //     "then it shouldn't create any CLIENTs and USERs resources in the database and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .send(createManyClientsMissingPassword)
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses POST /api/v1/resources/users/clients/createMany" +
  //     "send in body a array with password valid to create many clients but missing name" +
  //     "then it shouldn't create any CLIENTs and USERs resources in the database and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .send(createManyClientsMissingName)
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses POST /api/v1/resources/users/clients/createMany" +
  //     "without body data" +
  //     "then it shouldn't create any CLIENTs and USERs resources in the database and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .set("authorization", `Bearer ${accessTokenAsAdmin}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When an authenticated CLIENT accesses POST /api/v1/resources/users/clients/createMany " +
  //     "send in body a array with name and password valid to create many clients" +
  //     "then it shouldn't create any CLIENTs and USERs resources in the database and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .set("authorization", `Bearer ${accessTokenAsClient}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
  //       .send(createManyClients)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated Member accesses POST /api/v1/resources/users/clients/createMany " +
  //     "send in body a array with name and password valid to create many clients" +
  //     "then it shouldn't create any CLIENTs and USERs resources in the database and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .set("authorization", `Bearer ${accessTokenAsMember}`)
  //       .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
  //       .send(createManyClients)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When accesses POST /api/v1/resources/users/clients/createMany WITHOUT authentication " +
  //     "send in body a array with name and password valid to create many clients" +
  //     "then it shouldn't create any CLIENTs and USERs resources in the database and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .post(clientResourcePath + "/createMany")
  //       .send(createManyClients)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // UPDATE
  test(
    "When an authenticated admin accesses PUT /api/v1/resources/users/:userId/clients/:id " +
      'with name "Test Client Edited", ' +
      "then it should update the User with the new provided information",
    async () => {
      const response = await request(app)
        .put(
          userResourcePath + `/${userClient.id}/clients/${userClient.client.id}`
        )
        .send(updateClientBody)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      userClient = {
        ...userClient,
        ...updateClientBody,
      };

      expect(response.body.data.user.name).toBe(userClient.name);
      expect(response.body.data.user.id).toBe(userClient.id);
      expect(
        response.body.data.user.client.id === response.body.data.user.clientId
      ).toBeTruthy();
      expect(response.body.data.user.client.id).toBe(userClient.client.id);
      return expect(response.statusCode).toBe(200);
    }
  );

  // test(
  //   "When an authenticated client accesses PUT /api/v1/resources/users/:userId/clients/:id " +
  //     "without body" +
  //     "then it shouldn't update the User with the new provided information and return 422",
  //   async () => {
  //     const response = await request(app)
  //       .put(
  //         userResourcePath + `/${userClient.id}/admins/${userClient.client.id}`
  //       )
  //       .set("authorization", "Bearer " + accessTokenAsAdmin)
  //       .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When an authenticated CLIENT accesses PUT /api/v1/resources/users/:userId/clients/:id " +
  //     'with name "Test Client Edited", ' +
  //     "then it shouldn't update the User with the new provided information and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .put(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.client.id}`
  //       )
  //       .send({ user: { name: "Test Client Edited" } })
  //       .set("authorization", "Bearer " + accessTokenAsClient)
  //       .set("refreshToken", "Bearer " + refreshTokenAsClient)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When accesses PUT /api/v1/resources/users/:userId/clients/:id without authentication" +
  //     'with name "Test Client Edited", ' +
  //     "then it shouldn't update the User with the new provided information and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .put(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.client.id}`
  //       )
  //       .send({ user: { name: "Test Client Edited" } })
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated MEMBER accesses PUT /api/v1/resources/users/:userId/clients/:id " +
  //     'with name "Test Client Edited", ' +
  //     "then it shouldn't update the User with the new provided information and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .put(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.client.id}`
  //       )
  //       .send({ user: { name: "Test Client Edited" } })
  //       .set("authorization", "Bearer " + accessTokenAsMember)
  //       .set("refreshToken", "Bearer " + refreshTokenAsMember)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses PUT /api/v1/resources/users/:userId/clients/:id " +
  //     "with invalid params, " +
  //     "then it shouldn't update the User with the new provided information and return 401",
  //   async () => {
  //     const response = await request(app)
  //       .put(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.client.id}`
  //       )
  //       .send({ invalid: { params: "Test Client Edited" } })
  //       .set("authorization", "Bearer " + accessTokenAsAdmin)
  //       .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
  //       .expect(422);

  //     console.log(response.body);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // GET
  test(
    "When an authenticated admin accesses GET /api/v1/resources/users/clients/:id " +
      "with the ID of the first client, " +
      "then it should return the first client and associated user created",
    async () => {
      const response = await request(app)
        .get(
          userResourcePath + `/${userClient.id}/clients/${userClient.clientId}`
        )
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      expect(response.body.data.user.name).toBe(userClient.name);
      expect(response.body.data.user.client.id).toBe(userClient.client.id);
      expect(response.body.data.user.roleId).toBe(userClient.roleId);
      return expect(response.statusCode).toBe(200);
    }
  );

  // test(
  //   "When an authenticated CLIENT accesses GET /api/v1/resources/users/clients/:id " +
  //     "with the ID of the first client, " +
  //     "then it should return 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .get(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.clientId}`
  //       )
  //       .set("authorization", "Bearer " + accessTokenAsClient)
  //       .set("refreshToken", "Bearer " + refreshTokenAsClient)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated MEMBER accesses GET /api/v1/resources/users/clients/:id " +
  //     "with the ID of the first client, " +
  //     "then it should return 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .get(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.clientId}`
  //       )
  //       .set("authorization", "Bearer " + accessTokenAsMember)
  //       .set("refreshToken", "Bearer " + refreshTokenAsMember)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When accesses GET /api/v1/resources/users/clients/:id without authentication" +
  //     "with the ID of the first client, " +
  //     "then it should return 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .get(
  //         userResourcePath + `/${userClient.id}/clients/${userClient.clientId}`
  //       )
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // LIST
  test(
    "When an authenticated ADMIN accesses GET /api/v1/resources/users/clients " +
      "then it should return an array containing the first client created and the default client created",
    async () => {
      const response = await request(app)
        .get(clientResourcePath)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
        .expect(200);

      expect(response.body.data.length).toBe(10);
      expect(response.body.page).toBe(1);
      expect(response.body.hasNextPage).toBe(true);
      return expect(response.statusCode).toBe(200);
    }
  );

  // test(
  //   "When an authenticated CLIENT accesses GET /api/v1/resources/users/clients " +
  //     "then it should return 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .get(clientResourcePath)
  //       .set("authorization", "Bearer " + accessTokenAsClient)
  //       .set("refreshToken", "Bearer " + refreshTokenAsClient)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated MEMBER accesses GET /api/v1/resources/users/clients " +
  //     "then it should return 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .get(clientResourcePath)
  //       .set("authorization", "Bearer " + accessTokenAsMember)
  //       .set("refreshToken", "Bearer " + refreshTokenAsMember)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When accesses GET /api/v1/resources/users/clients without authentication " +
  //     "then it should return 401 status code",
  //   async () => {
  //     const response = await request(app).get(clientResourcePath).expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // DELETE
  // test(
  //   "When an autenticated ADMIN accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2" +
  //     "then it should return a 204 status and delete all the ids sent in query parameters",
  //   async () => {
  //     const response = await request(app)
  //       .delete(
  //         `${userResourcePath}/deleteMany?ids=${clients
  //           .map((clt) => clt.id)
  //           .join(",")}`
  //       )
  //       .set("authorization", "Bearer " + accessTokenAsAdmin)
  //       .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
  //       .expect(204);

  //     return expect(response.statusCode).toBe(204);
  //   }
  // );

  // test(
  //   "When an autenticated CLIENT accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2" +
  //     "then it should return a 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .delete(
  //         `${userResourcePath}/deleteMany?ids=${clients
  //           .map((clt) => clt.id)
  //           .join(",")}`
  //       )
  //       .set("authorization", "Bearer " + accessTokenAsClient)
  //       .set("refreshToken", "Bearer " + refreshTokenAsClient)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an autenticated ADMIN accesses DELETE /api/v1/resources/users/deleteMany without ids query params" +
  //     "then it should return a 400 status code",
  //   async () => {
  //     const response = await request(app)
  //       .delete(`${userResourcePath}/deleteMany`)
  //       .set("authorization", "Bearer " + accessTokenAsAdmin)
  //       .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
  //       .expect(400);

  //     return expect(response.statusCode).toBe(400);
  //   }
  // );

  // test(
  //   "When an autenticated MEMBER accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2" +
  //     "then it should return a 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .delete(
  //         `${userResourcePath}/deleteMany?ids=${clients
  //           .map((clt) => clt.id)
  //           .join(",")}`
  //       )
  //       .set("authorization", "Bearer " + accessTokenAsMember)
  //       .set("refreshToken", "Bearer " + refreshTokenAsMember)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When accesses DELETE /api/v1/resources/users/deleteMany?ids=id1&id2 without authentication " +
  //     "then it should return a 401 status code",
  //   async () => {
  //     const response = await request(app)
  //       .delete(
  //         `${userResourcePath}/deleteMany?ids=${clients
  //           .map((clt) => clt.id)
  //           .join(",")}`
  //       )
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  test(
    "When an authenticated ADMIN accesses DELETE /api/v1/resources/users/clients/:id " +
      "then it should return a 204 status and delete the first admin created",
    async () => {
      const response = await request(app)
        .delete(userResourcePath + `/${userClient.id}`)
        .set("authorization", "Bearer " + accessTokenAsAdmin)
        .set("refreshToken", refreshTokenAsAdmin)
        .expect(204);

      return expect(response.statusCode).toBe(204);
    }
  );

  // test(
  //   "When an authenticated CLIENT accesses DELETE /api/v1/resources/users/clients/:id " +
  //     "then it should return a 401 status",
  //   async () => {
  //     const response = await request(app)
  //       .delete(userResourcePath + `/${userClient.id}`)
  //       .set("authorization", "Bearer " + accessTokenAsClient)
  //       .set("refreshToken", "Bearer " + refreshTokenAsClient)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated MEMBER accesses DELETE /api/v1/resources/users/clients/:id " +
  //     "then it should return a 401 status",
  //   async () => {
  //     const response = await request(app)
  //       .delete(userResourcePath + `/${userClient.id}`)
  //       .set("authorization", "Bearer " + accessTokenAsMember)
  //       .set("refreshToken", "Bearer " + refreshTokenAsMember)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated ADMIN accesses DELETE /api/v1/resources/users/clients/:id with id invalid" +
  //     "then it should return a 422 status",
  //   async () => {
  //     const response = await request(app)
  //       .delete(userResourcePath + "/123")
  //       .set("authorization", "Bearer " + accessTokenAsAdmin)
  //       .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
  //       .expect(422);

  //     return expect(response.statusCode).toBe(422);
  //   }
  // );

  // test(
  //   "When accesses DELETE /api/v1/resources/users/clients/:id without authentication " +
  //     "then it should return a 401 status",
  //   async () => {
  //     const response = await request(app)
  //       .delete(userResourcePath + `/${userClient.id}`)
  //       .expect(401);

  //     return expect(response.statusCode).toBe(401);
  //   }
  // );

  // test(
  //   "When an authenticated admin accesses DELETE /api/v1/resources/users/clients " +
  //     "then it should return a 404 status",
  //   async () => {
  //     const response = await request(app)
  //       .delete(userResourcePath)
  //       .set("authorization", "Bearer " + accessTokenAsAdmin)
  //       .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
  //       .expect(404);

  //     return expect(response.statusCode).toBe(404);
  //   }
  // );
});
