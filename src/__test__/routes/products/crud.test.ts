import { createAdminRoleIfNotExist } from "@/__test__/presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "@/__test__/presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "@/__test__/presets/createMemberRoleIfNotExists";
import { app } from "@/app";
import { CreateProductRequestBody } from "@/types/product/createRequestBody";
import { prismaClient } from "@libs/prisma";
import { Admin, Client, Member, Product, Role, User } from "@prisma/client";
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
      name: "Test Admin to test Products",
      password: "123",
      roleId: roleIdAdmin,
    }),
    createClient({
      name: "Test Client to test Products",
      password: "123",
      roleId: roleIdClient,
      address: {
        house: "Test House to test products",
        square: "Test Square to test products",
      },
    }),
  ]);

  adminAuthenticated = adminCreated;
  clientAuthenticated = clientCreated;
  memberAuthenticated = await createMember({
    name: "Test Member to test Products",
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

describe("CRUD PRODCUT RESOURCE", () => {
  const basePath = "/api/v1/resources/products";
  const setIdInBasePath = (id: string) => basePath + "/" + id;
  let productCreated: Product;
  let products: Array<Product>;

  describe("CREATE PRODUCT TEST", () => {
    let createRequestBody: Omit<CreateProductRequestBody, "adminId"> = {
      maxCreamsAllowed: 1,
      maxToppingsAllowed: 1,
      price: 1.99,
      size: "small",
      name: "TEST PRODUCT NAME CREATED",
    };
    describe("CREATING AS AN ADMIN", () => {
      test(
        `When an Admin access POST ${basePath}` +
          ` sending in body ${Object.keys(createRequestBody).join(", ")} ` +
          " then the response status will be 200 and the body will contain a created product",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          productCreated = response.body.data;

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty(
            "name",
            createRequestBody.name
          );
          expect(response.body.data).toHaveProperty(
            "size",
            createRequestBody.size
          );
          expect(response.body.data).toHaveProperty(
            "price",
            createRequestBody.price
          );
          expect(response.body.data).toHaveProperty(
            "adminId",
            adminAuthenticated.admin.id
          );
          expect(response.body.data).toHaveProperty(
            "maxCreamsAllowed",
            createRequestBody.maxCreamsAllowed
          );
          expect(response.body.data).toHaveProperty(
            "maxToppingsAllowed",
            createRequestBody.maxToppingsAllowed
          );
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Admin access POST ${basePath}` +
          ` without body ` +
          " then the response status will be 422 and the body will contain a message property with ''",
        async () => {
          const response = await request(app)
            .post(basePath)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          expect(response.body).toHaveProperty("message");
          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an Admin access POST ${basePath}` +
          ` missing some required params in body ` +
          " then the response status will be 422 and the body will contain a message property with ''",
        async () => {
          const { size, ...createRequestBodyMissingParam } = createRequestBody;
          const response = await request(app)
            .post(basePath)
            .send(createRequestBodyMissingParam)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          expect(response.body).toHaveProperty("message");
          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("CREATING AS A CLIENT", () => {
      test(
        `When a Client access POST ${basePath} ` +
          " sending all required parameters in body " +
          " then the response status will be 401 and the body will contain a message property with ''",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(401);

          return expect(response.body).toHaveProperty("message");
        }
      );
    });

    describe("CREATING AS A MEMBER", () => {
      test(
        `When a Member access POST ${basePath} ` +
          " sending all required parameters in body " +
          " then the response status will be 401 and the body will contain a message property with ''",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(401);

          return expect(response.body).toHaveProperty("message");
        }
      );
    });

    describe("CREATING WITHOUT AUTHENTICATION", () => {
      test(
        `When access POST ${basePath} without authentication` +
          " sending all required parameters in body " +
          " then the response status will be 401 and the body will contain a message property with ''",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .expect(401);

          return expect(response.body).toHaveProperty("message");
        }
      );
    });
  });

  describe("GET PRODUCT TEST", () => {
    describe("GETTING PRODUCT AS AN ADMIN", () => {
      test(
        `When an Admin access GET ${basePath}/:id` +
          " sendding id belongs to the product in router" +
          " then the response status will be 200 and the body will contain a data property with the product",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty(
            "name",
            productCreated.name
          );
          expect(response.body.data).toHaveProperty(
            "maxCreamsAllowed",
            productCreated.maxCreamsAllowed
          );
          expect(response.body.data).toHaveProperty(
            "maxToppingsAllowed",
            productCreated.maxToppingsAllowed
          );
          expect(response.body.data).toHaveProperty("id", productCreated.id);
          return expect(response.body.data).toHaveProperty(
            "size",
            productCreated.size
          );
        }
      );

      test(
        `When an Admin access GET ${basePath}/:id` +
          " sendding invalid id in router" +
          " then the response status will be 400 and the body will contain a message property with the value ''",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(400);

          console.log(response.body);

          return expect(response.body.data).toHaveProperty("message");
        }
      );
    });

    describe("GETTING PRODUCT AS A CLIENT", () => {
      test(
        `When an Client access GET ${basePath}/:id` +
          " sendding id belongs to the product in router" +
          " then the response status will be 200 and the body will contain a data property with the product",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty(
            "name",
            productCreated.name
          );
          expect(response.body.data).toHaveProperty(
            "maxCreamsAllowed",
            productCreated.maxCreamsAllowed
          );
          expect(response.body.data).toHaveProperty(
            "maxToppingsAllowed",
            productCreated.maxToppingsAllowed
          );
          expect(response.body.data).toHaveProperty("id", productCreated.id);
          return expect(response.body.data).toHaveProperty(
            "size",
            productCreated.size
          );
        }
      );

      test(
        `When an Client access GET ${basePath}/:id` +
          " sendding invalid id in router" +
          " then the response status will be 400 and the body will contain a message property with the value ''",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(400);

          console.log(response.body);

          return expect(response.body.data).toHaveProperty("message");
        }
      );
    });

    describe("GETTING PRODUCT AS A MEMBER", () => {
      test(
        `When an Member access GET ${basePath}/:id` +
          " sendding id belongs to the product in router" +
          " then the response status will be 200 and the body will contain a data property with the product",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty(
            "name",
            productCreated.name
          );
          expect(response.body.data).toHaveProperty(
            "maxCreamsAllowed",
            productCreated.maxCreamsAllowed
          );
          expect(response.body.data).toHaveProperty(
            "maxToppingsAllowed",
            productCreated.maxToppingsAllowed
          );
          expect(response.body.data).toHaveProperty("id", productCreated.id);
          return expect(response.body.data).toHaveProperty(
            "size",
            productCreated.size
          );
        }
      );

      test(
        `When an Member access GET ${basePath}/:id` +
          " sendding invalid id in router" +
          " then the response status will be 400 and the body will contain a message property with the value ''",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(400);

          console.log(response.body);

          return expect(response.body.data).toHaveProperty("message");
        }
      );
    });

    describe("GETTING PRODUCT WITHOUT AUTHENTICATION", () => {
      test(
        `When access GET ${basePath}/:id without authentication` +
          " sendding id belongs to the product in router" +
          " then the response status will be 401 and the body will contain a message property with the value ''",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath(productCreated.id))
            .expect(401);

          console.log(response.body);

          return expect(response.body.data).toHaveProperty("message");
        }
      );
    });
  });

  describe("DELETE PRODUCT TEST", () => {
    describe("DELETING AS AN ADMIN", () => {
      test(
        `When an Admin access delete ${basePath}/:id` +
          " in which the id in router parameter is the a valid product" +
          " the response status code will be 204",
        async () => {
          await request(app)
            .delete(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(204);

          products = await prismaClient.product.findMany();

          return expect(
            products.every((prod) => prod.id !== productCreated.id)
          ).toBeTruthy();
        }
      );

      test(
        `When an Admin access delete ${basePath}/:id` +
          " in which the id in router parameter doesn't belongs to a product" +
          " the response status code will be 400",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(400);

          return expect(response.statusCode).toBe(400);
        }
      );
    });

    describe("DELETING AS A CLIENT", () => {
      test(
        `When an Client access delete ${basePath}/:id` +
          " in which the id in router parameter is the a valid product" +
          " the response status code will be 401 and in body response will contain the message property with ''",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(401);

          expect(response.body).toHaveProperty("message");
          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING AS A MEMBER", () => {
      test(
        `When an Member access delete ${basePath}/:id` +
          " in which the id in router parameter is the a valid product" +
          " the response status code will be 401 and in body response will contain the message property with ''",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(401);

          expect(response.body).toHaveProperty("message");
          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING WHITOUT AUTHENTICATION", () => {
      test(
        `When access delete ${basePath}/:id without authentication` +
          " in which the id in router parameter is the a valid product" +
          " the response status code will be 401 and in body response will contain the message property with ''",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath(productCreated.id))
            .expect(401);

          expect(response.body).toHaveProperty("message");
          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });
});
