import { createAdminRoleIfNotExist } from "@/__test__/presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "@/__test__/presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "@/__test__/presets/createMemberRoleIfNotExists";
import { app } from "@/app";
import { CreateToppingRequestBody } from "@/types/topping/createRequestBody";
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
  return;
});

afterAll(async () => {
  return await prismaClient.user.deleteMany({
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
    describe("CREATING TOPPING AS ADMIN", () => {
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

    describe("CREATING TOPPING AS CLIENT", () => {
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

    describe("CREATING TOPPING AS MEMBER", () => {
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

    describe("CREATING TOPPING WITHOUT AUTHENTICATION", () => {
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

  describe("GET TESTS", () => {
    describe("GETTING TOPPING AS ADMIN", () => {
      test(
        `When an Admin access GET ${baseUrl}/:id` +
          " sending in router parameter id that is a existing topping " +
          " the response status code will be 200 and the topping belongs to the id.",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl(topping.id))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data.id", topping.id);
          expect(response.body).toHaveProperty("data.name", topping.name);
          expect(response.body).toHaveProperty("data.adminId", topping.adminId);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Admin access GET ${baseUrl}/:id` +
          " sending in router parameter an invalid id " +
          " the response status code will be 422 and the in body request will be a message property with value 'Error to retrivier topping: No Topping found'",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl("invalid-id"))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          expect(response.body).toHaveProperty(
            "message",
            "Error to retrivier topping: No Topping found"
          );
          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("GETTING TOPPING AS CLIENT", () => {
      test(
        `When an Client access GET ${baseUrl}/:id` +
          " sending in router parameter id that is a existing topping " +
          " the response status code will be 200 and the topping belongs to the id.",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl(topping.id))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data.id", topping.id);
          expect(response.body).toHaveProperty("data.name", topping.name);
          expect(response.body).toHaveProperty("data.adminId", topping.adminId);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Client access GET ${baseUrl}/:id` +
          " sending in router parameter an invalid id " +
          " the response status code will be 422 and the in body request will be a message property with value 'Error to retrivier topping: No Topping found'",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl("invalid-id"))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(422);

          expect(response.body).toHaveProperty(
            "message",
            "Error to retrivier topping: No Topping found"
          );
          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("GETTING TOPPING AS MEMBER", () => {
      test(
        `When an Member access GET ${baseUrl}/:id` +
          " sending in router parameter id that is a existing topping " +
          " the response status code will be 200 and the topping belongs to the id.",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl(topping.id))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data.id", topping.id);
          expect(response.body).toHaveProperty("data.name", topping.name);
          expect(response.body).toHaveProperty("data.adminId", topping.adminId);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Member access GET ${baseUrl}/:id` +
          " sending in router parameter an invalid id " +
          " the response status code will be 422 and the in body request will be a message property with value 'Error to retrivier topping: No Topping found'",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl("invalid-id"))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(422);

          expect(response.body).toHaveProperty(
            "message",
            "Error to retrivier topping: No Topping found"
          );
          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("GETTING TOPPING WITHOUT AUTHENTTICATION", () => {
      test(
        `When access GET ${baseUrl}/:id without authentication` +
          " sending in router parameter id that is a existing topping " +
          " the response status code will be 401 and in the response body there will be an attribute 'message' with text 'Unauthorized: No access token provided'.",
        async () => {
          const response = await request(app)
            .get(setIdInBaseUrl(topping.id))
            .expect(401);

          expect(response.body).toHaveProperty(
            "message",
            "Unauthorized: No access token provided"
          );
          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("LIST TESTS", () => {
    let toppingsCreated: Array<CreateToppingRequestBody>;
    describe("LISTING TOPPINGS AS AN ADMIN", () => {
      test(
        `When an Admin access GET ${baseUrl}` +
          " without any query parameters" +
          " the response status code will be 200 and in the response body there will be a list of first teen toppings",
        async () => {
          toppingsCreated = Array(20)
            .fill(null)
            .map((_, index) => ({
              adminId: adminAuthenticated.admin.id,
              name: `Test topping creating ${
                index % 2 === 0 ? "even" : "odd"
              } many ${index}`,
              amount: index % 2 === 0 ? index + 20 : index,
              available: index % 2 === 0,
              isSpecial: index % 2 === 0,
              unit: index % 2 === 0 ? "bag" : "litros",
              price: index % 2 === 0 ? 100 + index : index,
            }));

          await prismaClient.topping.createMany({
            data: toppingsCreated,
          });

          const response = await request(app)
            .get(baseUrl)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body).toHaveProperty("hasNextPage", true);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages", 3);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Admin access GET ${baseUrl}?filter=price:gte:100&perPage=5` +
          " the response status will be 200 and the body will contain data property with toppings values greater than or equals to 100",
        async () => {
          const response = await request(app)
            .get(baseUrl + "?filter=price:gte:100&perPage=5")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((topping: Topping) => topping.price >= 100)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Admin access GET ${baseUrl}?filter=name:like:even&perPage=5` +
          " the response status will be 200 and the body will contain data property with toppings name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(baseUrl + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((topping: Topping) =>
              topping.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Admin access GET ${baseUrl}?filter=available:true&perPage=5` +
          " the response status will be 200 and the body will contain data property with toppings name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(baseUrl + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((topping: Topping) =>
              topping.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );
    });

    describe("LISTING TOPPINGS AS A CLIENT", () => {
      test(
        `When an Client access GET ${baseUrl}` +
          " without any query parameters" +
          " the response status code will be 200 and in the response body there will be a list of first teen toppings",
        async () => {
          const response = await request(app)
            .get(baseUrl)
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body).toHaveProperty("hasNextPage", true);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages", 3);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Client access GET ${baseUrl}?filter=price:gte:100&perPage=5` +
          " the response status will be 200 and the body will contain data property with toppings values greater than or equals to 100",
        async () => {
          const response = await request(app)
            .get(baseUrl + "?filter=price:gte:100&perPage=5")
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((topping: Topping) => topping.price >= 100)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Client access GET ${baseUrl}?filter=name:like:even&perPage=5` +
          " the response status will be 200 and the body will contain data property with toppings name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(baseUrl + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((topping: Topping) =>
              topping.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Client access GET ${baseUrl}?filter=available:true&perPage=5` +
          " the response status will be 200 and the body will contain data property with toppings name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(baseUrl + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((topping: Topping) =>
              topping.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );
    });
  });

  describe("DELETE TESTS", () => {
    describe("DELETING TOPPING AS ADMIN", () => {
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

      test(
        `When an Admin access DELETE ${baseUrl}/invalid-id` +
          " the response will be 422 and in the body response has a message property with 'Record to delete does not exist.'",
        async () => {
          const response = await request(app)
            .delete(baseUrl + "/invalid-id")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          expect(response.body).toHaveProperty(
            "message",
            "Record to delete does not exist."
          );

          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("DELETING TOPPING AS CLIENT", () => {
      test(
        `When a Client access DELETE ${baseUrl}/:id` +
          " sending, in router, the id of topping existing, " +
          " the response stauts code will be 401 and in the body will be contain the message property with value 'User haven't permission'",
        async () => {
          const response = await request(app)
            .delete(setIdInBaseUrl(topping.id))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(401);

          expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING TOPPING AS MEMBER", () => {
      test(
        `When a Member access DELETE ${baseUrl}/:id` +
          " sending, in router, the id of topping existing, " +
          " the response stauts code will be 401 and in the body will be contain the message property with value 'User haven't permission'",
        async () => {
          const response = await request(app)
            .delete(setIdInBaseUrl(topping.id))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(401);

          expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING TOPPING WITHOUT AUTHENTICATION", () => {
      test(
        `When access DELETE ${baseUrl}/:id without authentication` +
          " sending, in router, the id of topping existing, " +
          " the response stauts code will be 401 and in the body will be contain the message property with value 'No authorization required'",
        async () => {
          const response = await request(app)
            .delete(setIdInBaseUrl(topping.id))
            .expect(401);

          expect(response.body).toHaveProperty(
            "message",
            "No authorization required"
          );
          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });
});
