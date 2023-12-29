import { createAdminRoleIfNotExist } from "@/__test__/presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "@/__test__/presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "@/__test__/presets/createMemberRoleIfNotExists";
import { app } from "@/app";
import { saveSwaggerDefinitions } from "@/generateSwagger";
import { CreateProductRequestBody } from "@/types/product/createRequestBody";
import { UpdateProductRequestBody } from "@/types/product/updateRequestBody";
import { prismaClient } from "@libs/prisma";
import { Admin, Client, Member, Product, Role, User } from "@prisma/client";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import request from "supertest";
import swaggerDefinition from "@/swagger-spec.json";

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

const createRequestBody: Omit<CreateProductRequestBody, "adminId"> = {
  maxCreamsAllowed: 1,
  maxToppingsAllowed: 1,
  price: 1.99,
  size: "small",
  name: "TEST PRODUCT NAME CREATED",
  available: true,
  photo: "url-photo",
};

const productsUpdated: UpdateProductRequestBody = {
  name: "Test Product updated as Admin",
  size: "Update size product test",
  available: false,
  photo: "some-photo.jpg",
  price: 12.5,
  maxCreamsAllowed: 2,
  maxToppingsAllowed: 2,
};

afterAll(async () => {
  await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1/resources/products": {
        post: {
          summary: "Create Product",
          description: "Endpoint to add a new Product to the system.",
          tags: ["Product"],
          requestBody: {
            description: "Product details for creation",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    price: {
                      type: "number",
                      example: createRequestBody.price,
                      require: true,
                    },
                    size: {
                      type: "number",
                      example: createRequestBody.size,
                      require: true,
                    },
                    maxCreamsAllowed: {
                      type: "number",
                      example: createRequestBody.maxCreamsAllowed,
                      require: true,
                    },
                    maxToppingsAllowed: {
                      type: "number",
                      example: createRequestBody.maxToppingsAllowed,
                      require: true,
                    },
                    photo: {
                      type: "string",
                      example: createRequestBody.photo,
                      require: false,
                    },
                    name: {
                      type: "string",
                      example: createRequestBody.name,
                      require: false,
                    },
                    available: {
                      type: "boolean",
                      example: createRequestBody.available,
                      require: false,
                    },
                  },
                  required: [
                    "maxCreamsAllowed",
                    "maxToppingsAllowed",
                    "price",
                    "size",
                  ],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful creating product",
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
          summary: "List Products",
          parameters: [
            {
              name: "page",
              in: "query",
              description: "Page to list products",
              required: false,
              schema: {
                type: "number",
                default: 1,
              },
            },
            {
              name: "perPage",
              in: "query",
              description: "How many products to return per page",
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
              description: "Filter products by some fields table",
              required: false,
              schema: {
                type: "string",
              },
              example:
                "name:like:some text here,id:some id here,price:gt:1000,amount:lt:5,createdAt:egt:some date ISO",
            },
          ],
          description:
            "Retrieve a list of products based on optional query parameters.",
          tags: ["Product"],
          responses: {
            "200": {
              description: "Successful getting product",
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
          summary: "Delete Many Products",
          parameters: [
            {
              name: "ids",
              in: "query",
              description: "ids of products to delete",
              required: true,
              schema: {
                type: "string",
                default: "id-1,id-2",
              },
            },
          ],
          description: "Delete products based on ids query parameter.",
          tags: ["Product"],
          responses: {
            "204": {
              description: "Successful deleting products",
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
      "/api/v1/resources/products/{id}": {
        get: {
          summary: "Get Product by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID of the Product to retrieve",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Retrieve details of a specific Product by its ID.",
          tags: ["Product"],
          responses: {
            "200": {
              description: "Successful getting product",
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
          summary: "Update Product",
          description: "Endpoint to update a Product to the system.",
          tags: ["Product"],
          requestBody: {
            description: "Product details for updating",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: productsUpdated.name,
                    },
                    price: {
                      type: "number",
                      example: productsUpdated.price,
                    },
                    photo: {
                      type: "string",
                      example: productsUpdated.photo,
                    },
                    size: {
                      type: "string",
                      example: productsUpdated.size,
                    },
                    maxCreamsAllowed: {
                      type: "string",
                      example: productsUpdated.maxCreamsAllowed,
                    },
                    maxToppingsAllowed: {
                      type: "string",
                      example: productsUpdated.maxToppingsAllowed,
                    },
                    available: {
                      type: "boolean",
                      example: productsUpdated.available,
                    },
                  },
                  required: ["name", "amount", "price", "unit"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful updating product",
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
          summary: "Delete Product",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "id of product to delete",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Delete product based on id path parameter.",
          tags: ["Product"],
          responses: {
            "204": {
              description: "Successful deleting product",
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
  let productsCreated: Array<CreateProductRequestBody>;

  describe("CREATE PRODUCT TEST", () => {
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

          createSuccessBodyResponse = response.body;

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
          " then the response status will be 422 and the body will contain a message property with 'price must be a float number and not empty'",
        async () => {
          const response = await request(app)
            .post(basePath)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          createUnprocessableBodyResponse = response.body;

          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain(
            "price must be a float number and not empty"
          );
        }
      );

      test(
        `When an Admin access POST ${basePath}` +
          ` missing some required params in body ` +
          " then the response status will be 422 and the body will contain a message property with 'size must be a string and not empty'",
        async () => {
          const { size, ...createRequestBodyMissingParam } = createRequestBody;
          const response = await request(app)
            .post(basePath)
            .send(createRequestBodyMissingParam)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain(
            "size must be a string and not empty"
          );
        }
      );
    });

    describe("CREATING AS A CLIENT", () => {
      test(
        `When a Client access POST ${basePath} ` +
          " sending all required parameters in body " +
          " then the response status will be 401 and the body will contain a message property with 'User haven't permission'",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
        }
      );
    });

    describe("CREATING AS A MEMBER", () => {
      test(
        `When a Member access POST ${basePath} ` +
          " sending all required parameters in body " +
          " then the response status will be 401 and the body will contain a message property with 'User haven't permission'",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
        }
      );
    });

    describe("CREATING WITHOUT AUTHENTICATION", () => {
      test(
        `When access POST ${basePath} without authentication` +
          " sending all required parameters in body " +
          " then the response status will be 401 and the body will contain a message property with 'No authorization required'",
        async () => {
          const response = await request(app)
            .post(basePath)
            .send(createRequestBody)
            .expect(401);

          createUnauthorizedBodyResponse = response.body;

          return expect(response.body).toHaveProperty(
            "message",
            "No authorization required"
          );
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

          getSuccessBodyResponse = response.body;

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
          " then the response status will be 400 and the body will contain a message property with the value 'No Product found'",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(400);

          getBadRequestBodyResponse = response.body;

          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain("No Product found");
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
          " then the response status will be 400 and the body will contain a message property with the value 'No Product found'",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(400);
          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain("No Product found");
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
          " then the response status will be 400 and the body will contain a message property with the value 'No Product found'",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath("invalid-id"))
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(400);

          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain("No Product found");
        }
      );
    });

    describe("GETTING PRODUCT WITHOUT AUTHENTICATION", () => {
      test(
        `When access GET ${basePath}/:id without authentication` +
          " sendding id belongs to the product in router" +
          " then the response status will be 401 and the body will contain a message property with the value 'No access token provided'",
        async () => {
          const response = await request(app)
            .get(setIdInBasePath(productCreated.id))
            .expect(401);

          getUnauthorizedBodyResponse = response.body;

          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain(
            "No access token provided"
          );
        }
      );
    });
  });

  describe("LIST PRODUCT TESTS", () => {
    describe("LISTING PRODUCTS AS AN ADMIN", () => {
      test(
        `When an Admin access GET ${basePath}` +
          " without any query parameters" +
          " the response status code will be 200 and in the response body there will be a list of first teen products",
        async () => {
          productsCreated = Array(20)
            .fill(null)
            .map((_, index) => ({
              adminId: adminAuthenticated.admin.id,
              name: `Test product creating ${
                index % 2 === 0 ? "even" : "odd"
              } many ${index}`,
              size: `10${index}`,
              maxCreamsAllowed: index % 2 === 0 ? 2 : 1,
              maxToppingsAllowed: index % 2 === 0 ? 2 : 1,
              available: index % 2 === 0,
              price: index % 2 === 0 ? 100 + index : index,
            }));

          await prismaClient.product.createMany({
            data: productsCreated,
          });

          products = await prismaClient.product.findMany({
            where: {
              name: {
                in: productsCreated.map((tpg) => tpg.name),
              },
            },
          });

          const response = await request(app)
            .get(basePath)
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
        `When an Admin access GET ${basePath}?filter=price:gte:100&perPage=5` +
          " the response status will be 200 and the body will contain data property with products values greater than or equals to 100",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=price:gte:100&perPage=5")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) => product.price >= 100)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Admin access GET ${basePath}?filter=name:like:even&perPage=5` +
          " the response status will be 200 and the body will contain data property with products name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) =>
              product.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Admin access GET ${basePath}?filter=available:true&perPage=5` +
          " the response status will be 200 and the body will contain data property with products available true.",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=available:true&perPage=5")
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) => product.available)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Admin access GET ${basePath}?filter=available:true&perPage=5` +
          " sending parameters in body request" +
          " the response status will be 422 and in the body response will contain the message property with text 'Unknown field(s)'",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=name:like:even&perPage=5")
            .send({ parameter: { something: "invalid parameter" } })
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(422);

          expect(response.body).toHaveProperty("message", "Unknown field(s)");
          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("LISTING PRODUCTS AS A CLIENT", () => {
      test(
        `When an Client access GET ${basePath}` +
          " without any query parameters" +
          " the response status code will be 200 and in the response body there will be a list of first teen products",
        async () => {
          const response = await request(app)
            .get(basePath)
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
        `When an Client access GET ${basePath}?filter=price:gte:100&perPage=5` +
          " the response status will be 200 and the body will contain data property with products values greater than or equals to 100",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=price:gte:100&perPage=5")
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) => product.price >= 100)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Client access GET ${basePath}?filter=name:like:even&perPage=5` +
          " the response status will be 200 and the body will contain data property with products name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) =>
              product.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Client access GET ${basePath}?filter=available:true&perPage=5` +
          " the response status will be 200 and the body will contain data property with products available true.",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=available:true&perPage=5")
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) => product.available)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );
    });

    describe("LISTING PRODUCTS AS A MEMBER", () => {
      test(
        `When an Member access GET ${basePath}` +
          " without any query parameters" +
          " the response status code will be 200 and in the response body there will be a list of first teen products",
        async () => {
          const response = await request(app)
            .get(basePath)
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body).toHaveProperty("hasNextPage", true);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages", 3);
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an Member access GET ${basePath}?filter=price:gte:100&perPage=5` +
          " the response status will be 200 and the body will contain data property with products values greater than or equals to 100",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=price:gte:100&perPage=5")
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) => product.price >= 100)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Member access GET ${basePath}?filter=name:like:even&perPage=5` +
          " the response status will be 200 and the body will contain data property with products name containing 'even' in name field.",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=name:like:even&perPage=5")
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) =>
              product.name.includes("even")
            )
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );

      test(
        `When an Member access GET ${basePath}?filter=available:true&perPage=5` +
          " the response status will be 200 and the body will contain data property with products available true.",
        async () => {
          const response = await request(app)
            .get(basePath + "?filter=available:true&perPage=5")
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(
            response.body.data.every((product: Product) => product.available)
          ).toBeTruthy();
          return expect(response.body).toHaveProperty("data.length", 5);
        }
      );
    });

    describe("LISTING PRODUCTS WITHOUT AUTHENTICATION", () => {
      test(
        `When access GET ${basePath} without authentication` +
          " without any query parameters" +
          " the response status code will be 401",
        async () => {
          const response = await request(app).get(basePath).expect(401);

          expect(response.body).toHaveProperty(
            "message",
            "Unauthorized: No access token provided"
          );
          return expect(response.statusCode).toBe(401);
        }
      );

      test(
        `When access GET ${basePath} with invalid authentication` +
          " without any query parameters" +
          " the response status code will be 401",
        async () => {
          const response = await request(app)
            .get(basePath)
            .set("authorization", "Bearer invalid-token")
            .set("refreshToken", "Bearer invalid-token")
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

  describe("UPDATE PRODUCT TESTS", () => {
    describe("UPDATING PRODUCT AS AN ADMIN", () => {
      test(
        `When an Admin access PUT ${basePath}/:id` +
          " sending in body the parameters at least one of the parameters to update the product belongs to id sending in router params" +
          " then the response status code will be 200 and the body will return the product updated into data property",
        async () => {
          const response = await request(app)
            .put(setIdInBasePath(productCreated.id))
            .send(productsUpdated)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(200);

          updateSuccessBodyResponse = response.body;

          expect(response.body).toHaveProperty(
            "message",
            "Product updated successfully"
          );
          expect(response.body).toHaveProperty(
            "data.available",
            productsUpdated.available
          );
          expect(response.body).toHaveProperty(
            "data.photo",
            productsUpdated.photo
          );
          expect(response.body).toHaveProperty(
            "data.price",
            productsUpdated.price
          );
          return expect(response.body).toHaveProperty(
            "data.name",
            "Test Product updated as Admin"
          );
        }
      );

      test(
        `When an Admin access PUT ${basePath}/:id` +
          " with the body request empty" +
          " the response status code will be 400 and the body will contain the message 'At least one body'",
        async () => {
          const response = await request(app)
            .put(setIdInBasePath(productCreated.id))
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(400);

          updateBadRequestBodyResponse = response.body;

          return expect(response.body).toHaveProperty(
            "message",
            "At least one body"
          );
        }
      );

      test(
        `When an Admin access PUT ${basePath}/:id` +
          " sending in body the parameters at least one of the parameters to update the product doesn't belongs to id sending in router params" +
          " the response status code will be 400 and the body will contain the message 'At least one body'",
        async () => {
          const response = await request(app)
            .put(setIdInBasePath("invalid-id"))
            .send(productsUpdated)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(400);

          expect(response.body).toHaveProperty("message");
          return expect(response.body.message).toContain(
            "Error updating product"
          );
        }
      );
    });

    describe("UPDATING PRODUCT AS A CLIENT", () => {
      test(
        `When a Client access PUT ${basePath}/:id` +
          " sending in request body the object with properties to update products and the id in router parameters belongs to product" +
          " then the response status code is 401 and the request body contains message property with value 'User haven't permission'",
        async () => {
          const response = await request(app)
            .put(setIdInBasePath(productCreated.id))
            .send(productsUpdated)
            .set("authorization", accessTokenAsClient)
            .set("refreshToken", refreshTokenAsClient)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
        }
      );
    });

    describe("UPDATING PRODUCT AS A MEMBER", () => {
      test(
        `When a Member access PUT ${basePath}/:id` +
          " sending in request body the object with properties to update products and the id in router parameters belongs to product" +
          " then the response status code is 401 and the request body contains message property with value 'User haven't permission'",
        async () => {
          const response = await request(app)
            .put(setIdInBasePath(productCreated.id))
            .send(productsUpdated)
            .set("authorization", accessTokenAsMember)
            .set("refreshToken", refreshTokenAsMember)
            .expect(401);

          return expect(response.body).toHaveProperty(
            "message",
            "User haven't permission"
          );
        }
      );
    });

    describe("UPDATING PRODUCT WITHOUT AUTHENTICATION", () => {
      test(
        `When access PUT ${basePath}/:id without authentitcation` +
          " sending in request body the object with properties to update products and the id in router parameters belongs to product" +
          " then the response status code is 401 and the request body contains message property with value 'No authorization required'",
        async () => {
          const response = await request(app)
            .put(setIdInBasePath(productCreated.id))
            .send(productsUpdated)
            .expect(401);

          updateUnauthorizedBodyResponse = response.body;

          return expect(response.body).toHaveProperty(
            "message",
            "No authorization required"
          );
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
          " the response status code will be 401 and in body response will contain the message property with 'User haven't permission'",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath(productCreated.id))
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

    describe("DELETING AS A MEMBER", () => {
      test(
        `When an Member access delete ${basePath}/:id` +
          " in which the id in router parameter is the a valid product" +
          " the response status code will be 401 and in body response will contain the message property with 'User haven't permission'",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath(productCreated.id))
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

    describe("DELETING WHITOUT AUTHENTICATION", () => {
      test(
        `When access delete ${basePath}/:id without authentication` +
          " in which the id in router parameter is the a valid product" +
          " the response status code will be 401 and in body response will contain the message property with 'No authorization required'",
        async () => {
          const response = await request(app)
            .delete(setIdInBasePath(productCreated.id))
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

  describe("DELETE MANY PRODUCT TEST", () => {
    const baseUrlToDeleteMany = basePath + "/deleteMany";
    describe("DELETING MANY PRODUCT AS AN ADMIN", () => {
      test(
        `When an Admin access DELETE ${baseUrlToDeleteMany}?ids=id1,id2` +
          " sending, in query parameters, invalids ids" +
          " the response status will be 204",
        async () => {
          const productsWithInvalidIds = products.map((product) => product.id);
          productsWithInvalidIds.push("invalid-id");
          const response = await request(app)
            .delete(baseUrlToDeleteMany + `?ids=invalid-id`)
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );

      test(
        `When an Admin access DELETE ${baseUrlToDeleteMany}?ids=id1,id2` +
          " sending in query parameters the ids of the product that were deleted" +
          " the response status will be 204",
        async () => {
          const response = await request(app)
            .delete(
              baseUrlToDeleteMany +
                `?ids=${products.map((product) => product.id).join(",")}`
            )
            .set("authorization", accessTokenAsAdmin)
            .set("refreshToken", refreshTokenAsAdmin)
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );
    });

    describe("DELETING MANY PRODUCTS AS A CLIENT", () => {
      test(
        `When an Client access DELETE ${baseUrlToDeleteMany}?ids=id1,id2` +
          " sending, in query parameters, invalids ids" +
          " the response status will be 401 and in the response body will have message property with 'User haven't permission'",
        async () => {
          const productsWithInvalidIds = products.map((product) => product.id);
          productsWithInvalidIds.push("invalid-id");
          const response = await request(app)
            .delete(baseUrlToDeleteMany + `?ids=invalid-id`)
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

      test(
        `When an Client access DELETE ${baseUrlToDeleteMany}?ids=id1,id2` +
          " sending in query parameters the ids of the product that were deleted" +
          " the response status will be 401 and in the response body will have message property with 'User haven't permission'",
        async () => {
          const response = await request(app)
            .delete(
              baseUrlToDeleteMany +
                `?ids=${products.map((product) => product.id).join(",")}`
            )
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

    describe("DELETING MANY PRODUCT AS A MEMBER", () => {
      test(
        `When an Member access DELETE ${baseUrlToDeleteMany}?ids=id1,id2` +
          " sending, in query parameters, invalids ids" +
          " the response status will be 401 and in the response body will have message property with 'User haven't permission'",
        async () => {
          const productsWithInvalidIds = products.map((product) => product.id);
          productsWithInvalidIds.push("invalid-id");
          const response = await request(app)
            .delete(baseUrlToDeleteMany + `?ids=invalid-id`)
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

      test(
        `When an Member access DELETE ${baseUrlToDeleteMany}?ids=id1,id2` +
          " sending in query parameters the ids of the product that were deleted" +
          " the response status will be 401 and in the response body will have message property with 'User haven't permission'",
        async () => {
          const response = await request(app)
            .delete(
              baseUrlToDeleteMany +
                `?ids=${products.map((product) => product.id).join(",")}`
            )
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

    describe("DELETING MANY PRODUCTS WITHOUT AUTHENTICATION", () => {
      test(
        `When access DELETE ${baseUrlToDeleteMany}?ids=id1,id2 without authentication` +
          " sending, in query parameters, invalids ids" +
          " the response status will be 401 and in the response body will have message property with 'No authorization required'",
        async () => {
          const productsWithInvalidIds = products.map((product) => product.id);
          productsWithInvalidIds.push("invalid-id");
          const response = await request(app)
            .delete(baseUrlToDeleteMany + `?ids=invalid-id`)
            .expect(401);

          expect(response.body).toHaveProperty(
            "message",
            "No authorization required"
          );
          return expect(response.statusCode).toBe(401);
        }
      );

      test(
        `When access DELETE ${baseUrlToDeleteMany}?ids=id1,id2 without authentication` +
          " sending in query parameters the ids of the product that were deleted" +
          " the response status will be 401 and in the response body will have message property with 'No authorization required'",
        async () => {
          const response = await request(app)
            .delete(
              baseUrlToDeleteMany +
                `?ids=${products.map((product) => product.id).join(",")}`
            )
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
