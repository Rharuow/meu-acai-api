import { createAdminRoleIfNotExist } from "@/__test__/presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "@/__test__/presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "@/__test__/presets/createMemberRoleIfNotExists";
import { app } from "@/app";
import { prismaClient } from "@libs/prisma";
import { Admin, Client, Member, Role, Topping, User } from "@prisma/client";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import request from "supertest";

let adminAuthenticated: User & { role: Role; admin: Admin };
let clientAuthenticated: User & { role: Role; client: Client };
let memberAuthenticated: User & { role: Role; member: Member };

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

beforeAll(async () => {
  const [roleIdAdmin, roleIdClient, roleIdMember] = await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);

  const [adminCreated, clientCreated] = await Promise.all([
    createAdmin({
      name: "Test Admin to test Toppings",
      password: "123",
      roleId: roleIdAdmin,
    }),
    createClient({
      name: "Test Client to test Toppings",
      password: "123",
      roleId: roleIdClient,
      address: {
        house: "Test House to test toppings",
        square: "Test Square to test toppings",
      },
    }),
  ]);

  adminAuthenticated = adminCreated;
  clientAuthenticated = clientCreated;
  memberAuthenticated = await createMember({
    name: "Test Member to test toppings",
    password: "123",
    roleId: roleIdMember,
    clientId: clientAuthenticated.client.id,
  });

  const [
    responseSignInAsAdmin,
    responseSignInAsClient,
    responseSignInAsMember,
  ] = await Promise.all([
    request(app)
      .post("/api/v1/signin")
      .send({ name: adminAuthenticated.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({ name: clientAuthenticated.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({ name: memberAuthenticated.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
  ]);

  accessTokenAsAdmin = "Bearer " + responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = "Bearer " + responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = "Bearer " + responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = "Bearer " + responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = "Bearer " + responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = "Bearer " + responseSignInAsMember.body.refreshToken;
});

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [
          adminAuthenticated.id,
          clientAuthenticated.id,
          memberAuthenticated.id,
        ],
      },
    },
  });
});

describe("CRUD TOPPING RESOURCE", () => {
  const baseUrl = "/api/v1/resources/toppings";
  const setIdInBaseUrl = (id: string) => `${baseUrl}/${id}`;
  let topping: Topping;
  describe("CREATE TESTS", () => {
    const toppingCreate = {
      name: "Test Topping created as Admin",
      price: 12.99,
      amount: 2,
      unit: "unidade",
    };
    describe("CREATE TOPPING AS ADMIN", () => {
      test(
        `When an Admin access POST ${baseUrl}` +
          " sending name, price and amount in the request body" +
          " then the response status code is 200 and the adminId must be equal to the admin authenticated",
        async () => {
          const response = await request(app)
            .post(baseUrl)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .send(toppingCreate)
            .expect(200);

          topping = response.body.data;

          expect(response.body.data).toHaveProperty(
            "adminId",
            adminAuthenticated.admin.id
          );
          return expect(response.statusCode).toEqual(200);
        }
      );

      test(
        `When an Admin access POST ${baseUrl}` +
          " sending name and price but missing amount data in body request" +
          " then the response status code is 422 and the message in body 'amount must be a number and not empty'",
        async () => {
          const { amount, ...createBody } = toppingCreate;
          const response = await request(app)
            .post(baseUrl)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .send(createBody)
            .expect(422);

          return expect(response.body).toHaveProperty(
            "message",
            "amount must be a number and not empty"
          );
        }
      );

      test(
        `When Admin access POST ${baseUrl}` +
          " with body content empty" +
          " then the response status code is 422 and the message in body 'amount must be a number and not empty'",
        async () => {
          const response = await request(app)
            .post(baseUrl)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          return expect(response.body).toHaveProperty(
            "message",
            "amount must be a number and not empty"
          );
        }
      );
    });

    describe("CREATE TOPPING AS CLIENT", () => {
      test(
        `When a Client access POST ${baseUrl}` +
          " sending name, price and amount in the request body" +
          " then the response status code will be 401 and in the body request will have the message 'User haven't permission'",
        async () => {
          const response = await request(app)
            .post(baseUrl)
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .send(toppingCreate)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
        }
      );
    });

    describe("CREATE TOPPING AS MEMBER", () => {
      test(
        `When a Member access POST ${baseUrl}` +
          " sending name, price and amount in the request body" +
          " then the response status code will be 401 and in the body request will have the message 'User haven't permission'",
        async () => {
          const response = await request(app)
            .post(baseUrl)
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .send(toppingCreate)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
        }
      );
    });

    describe("CREATE TOPPING WITHOUT AUTHENTICATION", () => {
      test(
        `When access POST ${baseUrl} without authentication ` +
          " sending name, price and amount in the request body" +
          " then the response status code will be 401 and in the body request will have the message 'No authorization required'",
        async () => {
          const response = await request(app)
            .post(baseUrl)
            .send(toppingCreate)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "No authorization required"
          );
        }
      );
    });
  });

  describe("DELETE TESTS", () => {
    describe("DELETE TOPPINGS AS ADMIN", () => {
      test(
        `When an Admin access DELETE ${baseUrl}/:id` +
          " sending, in router, the id of topping existing, " +
          " the response stauts code will be 204",
        async () => {
          const response = await request(app)
            .delete(setIdInBaseUrl(topping.id))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );
    });
  });
});
