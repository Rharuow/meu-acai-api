import { createAllKindOfUserAndRoles } from "@/__test__/utils/beforeAll/Users";
import {
  userAsAdmin,
  userAsClient,
  userAsMember,
} from "@/__test__/utils/users";
import { app } from "@/app";
import { prismaClient } from "@libs/prisma";
import { encodeSha256 } from "@libs/crypto";
import { Client, Role, User } from "@prisma/client";
import { getUserByNameAndPassword } from "@repositories/user";
import request from "supertest";
import { verify } from "jsonwebtoken";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let clientsToDelete: Array<User>;

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

let updateClientBody = {
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

let clientAuthenticated: User & { role: Role };

const createManyClients = Array(15)
  .fill(null)
  .map((_, index) => ({
    name: `Test Client ${index + 1}`,
    password: "123",
    address: {
      square: (index + 3 + 100).toString(),
      house: (index + 3 + 100).toString(),
    },
  }));

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
    .send(userAsMember)
    .set("Accept", "application/json")
    .expect(200);

  accessTokenAsAdmin = responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = responseSignInAsMember.body.refreshToken;

  verify(
    accessTokenAsClient,
    process.env.TOKEN_SECRET,
    async (err, user: User & { role: Role }) => {
      if (err) console.log("ERROR TO VERIFY CLIENT ACCESS TOKEN", err);
      const userLogged = await prismaClient.user.findUnique({
        where: {
          id: user.id,
        },
        include: {
          role: true,
        },
      });
      clientAuthenticated = userLogged;
    }
  );
});
describe("CRUD CLIENT RESOURCE", () => {
  describe("TEST TO CREATE CLIENT RESOURCE", () => {
    describe("CREATING CLIENT AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses POST ${clientResourcePath} ` +
          `with name ${createClientBody.name}, password ${createClientBody.password}, square ${createClientBody.address.square}, house ${createClientBody.address.house} ` +
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

      test(
        `When an authenticated ADMIN accesses POST ${clientResourcePath} ` +
          "without body data" +
          "then it shouldn't create a new User and a new Client resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(clientResourcePath)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated ADMIN accesses POST ${clientResourcePath} ` +
          "with body missing password " +
          "then it shouldn't create a new User and a new Client resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(clientResourcePath)
            .send(createClientBodyMissingPassword)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated ADMIN accesses POST ${clientResourcePath} ` +
          "with body missing name " +
          "then it shouldn't create a new User and a new Client resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(clientResourcePath)
            .send(createClientBodyMissingName)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("CREATING CLIENT AS A CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses POST ${clientResourcePath}` +
          `with name ${createClientBody.name} and password ${createClientBody.password}, ` +
          "then it shouldn't create a new User and a new Client resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(clientResourcePath)
            .send(createClientBody)
            .set("authorization", `Bearer ${accessTokenAsClient}`)
            .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("CREATING CLIENT AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses POST ${clientResourcePath}` +
          `with name ${createClientBody.name} and password ${createClientBody.password}, ` +
          "then it shouldn't create a new User and a new Client resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(clientResourcePath)
            .send(createClientBody)
            .set("authorization", `Bearer ${accessTokenAsMember}`)
            .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("CREATING CLIENT WITHOUT AUTHENTITCATION", () => {
      test(
        `When accesses POST ${clientResourcePath} WITHOUT authentication` +
          `with name ${createClientBody.name} and password ${createClientBody.password}, ` +
          "then it shouldn't create a new User and a new Client resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(clientResourcePath)
            .send(createClientBody)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO UPDATE CLIENT RESOURCE", () => {
    describe("UPDATING CLIENT AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          `with name ${updateClientBody.name}, ` +
          "then it should update the User with the new provided information",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.client.id}`
            )
            .send(updateClientBody)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(200);

          userClient = {
            ...userClient,
            ...updateClientBody,
          };

          expect(response.body.data.user.name).toBe(updateClientBody.name);
          expect(response.body.data.user.id).toBe(userClient.id);
          expect(
            response.body.data.user.client.id ===
              response.body.data.user.clientId
          ).toBeTruthy();
          expect(response.body.data.user.client.id).toBe(userClient.client.id);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          "without body" +
          "then it shouldn't update the User with the new provided information and return 400",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.client.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(400);

          return expect(response.statusCode).toBe(400);
        }
      );

      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          "with invalid params, " +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.client.id}`
            )
            .send({ invalid: { params: "Test Client Edited" } })
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("UPDATING CLIENT AS A CLIENT", () => {
      const updatedFields = {
        email: "testclienteditedbyclient@mail.com",
        phone: "(00)0000000000",
      };
      test(
        `When an authenticated CLIENT accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          `with the name ${updateClientBody.name}, and sending the own ID. ` +
          "then it shouldn't update the User with the new provided information and return 200",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${clientAuthenticated.id}/clients/${clientAuthenticated.clientId}`
            )
            .send(updatedFields)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(200);

          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated CLIENT accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          `with the name ${updateClientBody.name}, and sending an ID that's not your own. ` +
          "then it shouldn't update the User with the new provided information and return 422",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${clientAuthenticated.id}/clients/${userClient.client.id}`
            )
            .send(updatedFields)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated CLIENT accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          `with the name ${updateClientBody.name}, and sending an ID and userId that's not are the user logged. ` +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const anotherUserClient = await prismaClient.user.findFirst({
            where: {
              id: {
                not: clientAuthenticated.id,
              },
              AND: {
                role: {
                  name: "CLIENT",
                },
              },
            },
            include: {
              client: true,
            },
          });

          const response = await request(app)
            .put(
              userResourcePath +
                `/${anotherUserClient.id}/clients/${anotherUserClient.clientId}`
            )
            .send(updatedFields)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("UPDATING CLIENT AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses PUT ${userResourcePath}/:userId/clients/:id ` +
          `with name ${updateClientBody.name}, ` +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.client.id}`
            )
            .send(updateClientBody)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("UPDATING CLIENT WITHOUT AUTHENTICATION", () => {
      test(
        `When accesses PUT ${userResourcePath}/:userId/clients/:id without authentication` +
          `with name ${updateClientBody.name}, ` +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.client.id}`
            )
            .send(updateClientBody)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO GET CLIENT RESOURCE", () => {
    describe("GETTING CLIENT AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses GET ${userResourcePath}/:userId/clients/:id ` +
          "with the ID of the first client, " +
          "then it should return the first client and associated user created",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.clientId}`
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
    });

    describe("GETTING CLIENT AS A CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses GET ${userResourcePath}/:userId/clients/:id ` +
          "with the id and userId of the user client logged, " +
          "then it should return 200 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${clientAuthenticated.id}/clients/${clientAuthenticated.clientId}`
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(200);

          expect(response.statusCode).toBe(200);
          expect(response.body.data).toHaveProperty("user");
          expect(response.body.data.user).toHaveProperty(
            "name",
            clientAuthenticated.name
          );
          expect(response.body.data.user).toHaveProperty(
            "id",
            clientAuthenticated.id
          );
          return expect(response.body.data.user).toHaveProperty(
            "clientId",
            clientAuthenticated.clientId
          );
        }
      );

      test(
        `When an authenticated CLIENT accesses GET ${userResourcePath}/:userId/clients/:id ` +
          "with the id and userId different from the user client logged, " +
          "then it should return 401 status code",
        async () => {
          const anotherUserClients = await prismaClient.user.findFirst({
            where: {
              role: {
                name: "CLIENT",
              },
              AND: {
                id: {
                  not: clientAuthenticated.id,
                },
              },
            },
          });

          const response = await request(app)
            .get(
              userResourcePath +
                `/${anotherUserClients.id}/clients/${anotherUserClients.clientId}`
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("GETTING CLIENT AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses GET ${clientResourcePath}/:id ` +
          "with the ID of the first client, " +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.clientId}`
            )
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("GETTING CLIENT WITHOUT AUTHENTICATION", () => {
      test(
        `When accesses GET ${clientResourcePath}/:id without authentication` +
          "with the ID of the first client, " +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userClient.id}/clients/${userClient.clientId}`
            )
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO LIST CLIENT RESOURCE", () => {
    describe("LISTING CLIENT AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses GET ${clientResourcePath} ` +
          "then it should return an array containing the first client created and the default client created",
        async () => {
          const roleId = (
            await prismaClient.role.findUnique({
              where: {
                name: "CLIENT",
              },
              select: {
                id: true,
              },
            })
          ).id;

          await prismaClient.address.createMany({
            data: createManyClients.map((client) => ({
              house: client.address.house,
              square: client.address.square,
            })),
          });

          const addressesIds = await prismaClient.address.findMany({
            where: {
              OR: createManyClients.map((client) => ({
                house: client.address.house,
                square: client.address.square,
              })),
            },
          });

          await prismaClient.user.createMany({
            data: createManyClients.map((client) => ({
              name: client.name,
              password: client.password,
              roleId,
            })),
          });

          const usersIds = await prismaClient.user.findMany({
            where: {
              OR: createManyClients.map((client) => ({
                name: client.name,
                password: client.password,
              })),
            },
          });

          await prismaClient.client.createMany({
            data: createManyClients.map((client, index) => ({
              addressId: addressesIds[index].id,
              userId: usersIds[index].id,
            })),
          });

          const response = await request(app)
            .get(clientResourcePath)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(200);

          await prismaClient.client.deleteMany({
            where: {
              addressId: {
                in: addressesIds.map((addressId) => addressId.id),
              },
            },
          });

          await prismaClient.address.deleteMany({
            where: {
              id: {
                in: addressesIds.map((addressId) => addressId.id),
              },
            },
          });

          expect(response.body.data.length).toBe(10);
          expect(response.body.page).toBe(1);
          expect(response.body.hasNextPage).toBe(true);
          return expect(response.statusCode).toBe(200);
        }
      );
    });

    describe("LISTING CLIENT AS A CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses GET ${clientResourcePath} ` +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(clientResourcePath)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("LISTING CLIENT AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses GET ${clientResourcePath} ` +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(clientResourcePath)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("LISTING CLIENT WITHOUT AUTHENTICATION", () => {
      test(
        `When accesses GET ${clientResourcePath} without authentication ` +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(clientResourcePath)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO DELETE CLIENT RESOURCE", () => {
    describe("DELETING CLIENT AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses DELETE ${userResourcePath}/:id ` +
          "then it should return a 204 status and delete the user and client referred by id router params",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/${userClient.id}`)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );

      test(
        `When an authenticated ADMIN accesses DELETE ${userResourcePath}/:id with invalid id` +
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
        `When an authenticated ADMIN accesses DELETE ${userResourcePath} ` +
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

    describe("DELETING CLIENT AS A CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses DELETE ${userResourcePath}/:id ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/${userClient.id}`)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING CLIENT AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses DELETE ${userResourcePath}/:id ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/${userClient.id}`)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING CLIENT WITHOUT AUTHENTITCATION", () => {
      test(
        `When accesses DELETE ${userResourcePath}/:id without authentication ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/${userClient.id}`)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MANY CLIENTS AS AN ADMIN", () => {
      test(
        `When an autenticated ADMIN accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2` +
          "then it should return a 204 status and delete all the ids sent in query parameters",
        async () => {
          clientsToDelete = await prismaClient.user.findMany({
            where: {
              name: {
                startsWith: "Test Client ",
              },
            },
          });

          const response = await request(app)
            .delete(
              `${userResourcePath}/deleteMany?ids=${clientsToDelete
                .map((clt) => clt.id)
                .join(",")}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );

      test(
        `When an autenticated ADMIN accesses DELETE ${userResourcePath}/deleteMany without ids query params` +
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
    });

    describe("DELETING MANY CLIENTS AS A CLIENT", () => {
      test(
        `When an autenticated CLIENT accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2` +
          "then it should return a 401 status code",
        async () => {
          const response = await request(app)
            .delete(
              `${userResourcePath}/deleteMany?ids=${clientsToDelete
                .map((clt) => clt.id)
                .join(",")}`
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MANY CLIENTS AS A MEMBER", () => {
      test(
        `When an autenticated MEMBER accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2` +
          "then it should return a 401 status code",
        async () => {
          const response = await request(app)
            .delete(
              `${userResourcePath}/deleteMany?ids=${clientsToDelete
                .map((clt) => clt.id)
                .join(",")}`
            )
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MANY CLIENTS WITHOUT AUTHENTICATION", () => {
      test(
        `When accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2 without authentication ` +
          "then it should return a 401 status code",
        async () => {
          const response = await request(app)
            .delete(
              `${userResourcePath}/deleteMany?ids=${clientsToDelete
                .map((clt) => clt.id)
                .join(",")}`
            )
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });
});
