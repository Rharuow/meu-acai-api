import { app } from "@/app";
import { prismaClient } from "@libs/prisma";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import request from "supertest";
import {
  cleanAdminTestDatabase,
  presetToAdminTests,
} from "@/__test__/presets/routes/admin";
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";
import { CreateAdminRequestBody } from "@/types/user/admin/createRequestBody";
import { UpdateAdminRequestBody } from "@/types/user/admin/updateRequestBody";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let admins: Array<User & { role?: Role } & { admin?: Admin }>;

const userResourcePath = "/api/v1/resources/users";

const adminResourcePath = "/api/v1/resources/users/admins";

const createAdminBody: Omit<CreateAdminRequestBody, "roleId"> = {
  name: "Test Admin Created",
  password: "123",
  email: "admin@example.com",
  phone: "123",
};

const updateAdminBody: UpdateAdminRequestBody = {
  name: "Test Admin Updated",
  email: "testadminupdated@mail.com",
  phone: "(00)000000000",
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
let userClient: User & { role?: Role } & { client?: Client };
let userMember: User & { role?: Role } & { member?: Member };

beforeAll(async () => {
  const user = await presetToAdminTests();

  userAdmin = user.userAdmin;
  userClient = user.userClient;
  userMember = user.userMember;

  const [
    responseSignInAsAdmin,
    responseSignInAsClient,
    responseSignInAsMember,
  ] = await Promise.all([
    request(app)
      .post("/api/v1/signin")
      .send({ name: userAdmin.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({ name: userClient.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({ name: userMember.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
  ]);

  accessTokenAsAdmin = responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = responseSignInAsMember.body.refreshToken;
});

let createSuccessBodyResponse = {};
let createUnprocessableBodyResponse = {};
let createUnauthorizedBodyResponse = {};

let getSuccessBodyResponse = {};
let getBadRequestBodyResponse = {};
let getUnauthorizedBodyResponse = {};

let listSuccessBodyResponse = {};
let listUnprocessableBodyResponse = {};
let listUnauthorizedBodyResponse = {};

let updateSuccessBodyResponse = {};
let updateBadRequestBodyResponse = {};
let updateUnauthorizedBodyResponse = {};

afterAll(async () => {
  await cleanAdminTestDatabase();

  await prismaClient.user.delete({
    where: {
      name: createAdminBody.name,
    },
  });

  return await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1/resources/users/admins": {
        post: {
          summary: "Create Admin",
          description: "Endpoint to add a new Admin to the system.",
          tags: ["Admin"],
          requestBody: {
            description: "Admin details for creation",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: createAdminBody.name,
                      require: true,
                    },
                    password: {
                      type: "string",
                      example: createAdminBody.password,
                      require: true,
                    },
                    email: {
                      type: "string",
                      example: createAdminBody.email,
                      require: false,
                    },
                    phone: {
                      type: "string",
                      example: createAdminBody.phone,
                      require: false,
                    },
                  },
                  required: ["name", "password"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful creating admin",
              content: {
                "application/json": { example: createSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: createUnprocessableBodyResponse,
                },
              },
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
              content: {
                "application/json": { example: createUnauthorizedBodyResponse },
              },
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
        get: {
          summary: "List Admins",
          parameters: [
            {
              name: "page",
              in: "query",
              description: "Page to list admins",
              required: false,
              schema: {
                type: "number",
                default: 1,
              },
            },
            {
              name: "perPage",
              in: "query",
              description: "How many admins to return per page",
              required: false,
              schema: {
                type: "number",
                default: 10,
              },
            },
            {
              name: "orderBy",
              in: "query",
              description: "Order by some field table",
              required: false,
              schema: {
                type: "string",
                default: "createdAt:asc",
              },
            },
            {
              name: "filter",
              in: "query",
              description: "Filter admins by some fields table",
              required: false,
              schema: {
                type: "string",
              },
              example:
                "name:like:some text here,id:some id here,price:gt:1000,amount:lt:5,createdAt:egt:some date ISO",
            },
          ],
          description:
            "Retrieve a list of admins based on optional query parameters.",
          tags: ["Admin"],
          responses: {
            "200": {
              description: "Successful getting admin",
              content: {
                "application/json": { example: listSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: listUnprocessableBodyResponse,
                },
              },
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
              content: {
                "application/json": { example: listUnauthorizedBodyResponse },
              },
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
        delete: {
          summary: "Delete Many Admins",
          parameters: [
            {
              name: "ids",
              in: "query",
              description: "ids of admins to delete",
              required: true,
              schema: {
                type: "string",
                default: "id-1,id-2",
              },
            },
          ],
          description: "Delete admins based on ids query parameter.",
          tags: ["Admin"],
          responses: {
            "204": {
              description: "Successful deleting admins",
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
      },
      "/api/v1/resources/users/{userId}/admins/{id}": {
        get: {
          summary: "Get Admin by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID of the Admin to retrieve",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "userId",
              in: "path",
              description: "ID of the User that is a Admin to retrieve",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Retrieve details of a specific Admin by its ID.",
          tags: ["Admin"],
          responses: {
            "200": {
              description: "Successful getting admin",
              content: {
                "application/json": { example: getSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: getBadRequestBodyResponse,
                },
              },
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
              content: {
                "application/json": { example: getUnauthorizedBodyResponse },
              },
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
        put: {
          summary: "Update Admin",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID of the Admin to update",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "userId",
              in: "path",
              description: "ID of the User that is a Admin to update",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Endpoint to update a Admin to the system.",
          tags: ["Admin"],
          requestBody: {
            description: "Admin details for updating",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: updateAdminBody.name,
                    },
                    phone: {
                      type: "string",
                      example: updateAdminBody.phone,
                    },
                    email: {
                      type: "string",
                      example: updateAdminBody.email,
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful updating admin",
              content: {
                "application/json": { example: updateSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: updateBadRequestBodyResponse,
                },
              },
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
              content: {
                "application/json": { example: updateUnauthorizedBodyResponse },
              },
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
        delete: {
          summary: "Delete Admin",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "id of admin to delete",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              name: "userId",
              in: "path",
              description: "id of user that is a admin to delete",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Delete admin based on id path parameter.",
          tags: ["Admin"],
          responses: {
            "204": {
              description: "Successful deleting admin",
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
      },
    },
  });
});

describe("CRUD ADMIN RESOURCE", () => {
  describe("TEST TO CREATE ADMIN RESOURCE", () => {
    describe("CREATING ADMIN AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses POST ${adminResourcePath} ` +
          `with name ${createAdminBody.name} and password ${createAdminBody.password}, ` +
          "then it should create a new User and a new Admin resource in the database",
        async () => {
          const response = await request(app)
            .post(adminResourcePath)
            .send(createAdminBody)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(200);

          createSuccessBodyResponse = response.body;

          expect(response.body.data.user).toHaveProperty(
            "name",
            createAdminBody.name
          );
          expect(response.body.data.user.role).toHaveProperty("name", "ADMIN");

          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated ADMIN accesses POST ${adminResourcePath} ` +
          "without body data" +
          " then it shouldn't create a new User and a new Admin resource in the database and return 422",
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
        `When an authenticated ADMIN accesses POST ${adminResourcePath} ` +
          "with body missing password " +
          "then it shouldn't create a new User and a new Admin resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(adminResourcePath)
            .send(createAdminBodyMissingPassword)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          createUnprocessableBodyResponse = response.body;

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated ADMIN accesses POST ${adminResourcePath} ` +
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
        `When accesses POST ${adminResourcePath} WITHOUT authentication` +
          `with name ${createAdminBody.name} and password ${createAdminBody.password}, ` +
          "then it shouldn't create a new User and a new Admin resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(adminResourcePath)
            .send(createAdminBody)
            .expect(401);

          createUnauthorizedBodyResponse = response.body;

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("CREATING ADMIN AS AN CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses POST ${adminResourcePath}` +
          `with name ${createAdminBody.name} and password ${createAdminBody.password}, ` +
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
    });

    describe("CREATING ADMIN AS AN MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses POST ${adminResourcePath}` +
          `with name ${createAdminBody.name} and password ${createAdminBody.password}, ` +
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
    });
  });

  describe("TEST TO UPDATE ADMIN RESOURCE", () => {
    describe("UPDATING ADMIN AS AN ADMIN", () => {
      test(
        `When an authenticated admin accesses PUT ${userResourcePath}/:userId/admins/:id ` +
          `with name ${updateAdminBody.name}, email ${updateAdminBody.email} and phone ${updateAdminBody.phone} ` +
          "then it should update the User with the new provided information",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .send(updateAdminBody)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(200);

          updateSuccessBodyResponse = response.body;

          expect(response.body.data.user.name).toBe(updateAdminBody.name);
          expect(response.body.data.user).toHaveProperty("admin");
          expect(response.body.data.user.admin).toHaveProperty(
            "email",
            updateAdminBody.email
          );
          expect(response.body.data.user.admin).toHaveProperty(
            "phone",
            updateAdminBody.phone
          );
          expect(response.body.data.user.admin.userId).toBe(
            userAdmin.admin.userId
          );
          expect(
            response.body.data.user.admin.id === userAdmin.admin.id
          ).toBeTruthy();
          expect(response.body.data.user.admin.id).toBe(userAdmin.admin.id);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated admin accesses PUT ${userResourcePath}/:userId/admins/:id ` +
          "without body" +
          " then it shouldn't update the User with the new provided information and return 400",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(400);

          updateBadRequestBodyResponse = response.body;

          return expect(response.statusCode).toBe(400);
        }
      );

      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/admins/:id ` +
          "with invalid params, " +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .send({ invalid: { params: "Test Admin Edited" } })
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When accesses PUT ${userResourcePath}/:userId/admins/:id without authentication` +
          `with name ${updateAdminBody.name}, ` +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .send(updateAdminBody)
            .expect(401);

          updateUnauthorizedBodyResponse = response.body;

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("UPDATING ADMIN AS AN CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses PUT ${userResourcePath}/:userId/admins/:id ` +
          `with name ${updateAdminBody.name}, ` +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .send(updateAdminBody)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("UPDATING ADMIN AS AN MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses PUT ${userResourcePath}/:userId/admins/:id ` +
          `with name ${updateAdminBody.name}, ` +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .send(updateAdminBody)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO GET ADMIN RESOURCE", () => {
    describe("GETTING ADMIN AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses GET ${userResourcePath}/:userId/admins/:id ` +
          "with the ID of the first admin, " +
          "then it should return the first admin and associated user created",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.admin.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(200);

          getSuccessBodyResponse = response.body;

          expect(response.body.data.user.name).toBe(userAdmin.name);
          expect(response.body.data.user.admin.id).toBe(userAdmin.admin.id);
          expect(response.body.data.user.roleId).toBe(userAdmin.roleId);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated ADMIN accesses GET ${adminResourcePath}/:id ` +
          "with invalid id in path parameter, " +
          "then it should return the first admin and associated user created",
        async () => {
          const response = await request(app)
            .get(userResourcePath + `/${userAdmin.id}/admins/invalid-id`)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);

          getBadRequestBodyResponse = response.body;

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When accesses GET ${adminResourcePath}/:id without authentication` +
          "with the ID of the first admin, " +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`
            )
            .expect(401);

          getUnauthorizedBodyResponse = response.body;

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("GETTING ADMIN AS A CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses GET ${adminResourcePath}/:id ` +
          "with the ID of the first admin, " +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("GETTING ADMIN AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses GET ${userResourcePath}/:userId/admins/:id ` +
          "with the ID of the first admin, " +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath + `/${userAdmin.id}/admins/${userAdmin.adminId}`
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
        `When accesses GET ${userResourcePath}/:userId/admins/:id without authentication` +
          "with the ID of the first client, " +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userClient.id}/admins/${userClient.clientId}`
            )
            .expect(401);

          getUnauthorizedBodyResponse = response.body;

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO LIST ADMIN RESOURCE", () => {
    describe("LISTING ADMIN AS AN ADMIN", () => {
      test(
        `When an authenticated admin accesses GET ${adminResourcePath} ` +
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
            .get(adminResourcePath)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(200);

          listSuccessBodyResponse = response.body;

          expect(response.body.data.length).toBe(10);
          expect(response.body.page).toBe(1);
          expect(response.body.hasNextPage).toBe(true);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated admin accesses GET ${adminResourcePath} ` +
          "sending invalid page param in query" +
          "then it should return 422 status code",
        async () => {
          const response = await request(app)
            .get(adminResourcePath + "?page=-1")
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);

          listUnprocessableBodyResponse = response.body;

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When accesses GET ${adminResourcePath} without authentication ` +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(adminResourcePath)
            .expect(401);

          listUnauthorizedBodyResponse = response.body;

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("LISTING ADMIN AS A CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses GET ${adminResourcePath} ` +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(adminResourcePath)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("LISTING ADMIN AS A MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses GET ${adminResourcePath} ` +
          "then it should return 401 status code",
        async () => {
          const response = await request(app)
            .get(adminResourcePath)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO DELETE ADMIN RESOURCE", () => {
    describe("DELETING MANY ADMIN AS AN ADMIN", () => {
      test(
        `When an autenticated ADMIN accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2` +
          " then it should return a 204 status and delete all the ids sent in query parameters",
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
        `When an autenticated ADMIN accesses DELETE ${userResourcePath}/deleteMany without ids query params` +
          " then it should return a 400 status code",
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
        `When accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2 without authentication ` +
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
    });

    describe("DELETING ADMIN AS A CLIENT", () => {
      test(
        `When an autenticated CLIENT accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2` +
          " then it should return a 401 status code",
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
        `When an authenticated CLIENT accesses DELETE ${userResourcePath}/:id ` +
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
    });

    describe("DELETING ADMIN AS A MEMBER", () => {
      test(
        `When an autenticated MEMBER accesses DELETE ${userResourcePath}/deleteMany?ids=id1&id2` +
          " then it should return a 401 status code",
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
        `When an authenticated MEMBER accesses DELETE ${userResourcePath}/:id ` +
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
    });

    describe("DELETING ADMIN AS AN ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses DELETE ${userResourcePath}/:id ` +
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
        `When an authenticated ADMIN accesses DELETE ${userResourcePath}/:id with id invalid` +
          " then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + "/123")
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );

      test(
        `When accesses DELETE ${userResourcePath}/:id without authentication ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/${userAdmin.id}`)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );

      test(
        `When an authenticated ADMIN accesses DELETE ${userResourcePath} ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });
});
