import { app } from "@/app";
import request from "supertest";
import { prismaClient } from "@libs/prisma";
import { Cream } from "@prisma/client";
import { CreateCreamRequestBody } from "@/types/creams/createRequestbody";
import { UpdateCreamRequestBody } from "@/types/creams/updateRequestBody";
import {
  cleanCreamTestDatabase,
  createTwentyCreams,
  presetToCreamTests,
} from "@/__test__/presets/routes/creams";
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let cream: Cream;

let creamsToDelete: Array<Cream>;

beforeAll(async () => {
  const { userAdmin, userClient, userMember } = await presetToCreamTests();

  await createTwentyCreams();

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

const createCreamRequestBody: Omit<CreateCreamRequestBody, "adminId"> = {
  name: "Test Cream",
  price: 9.99,
  amount: 1,
  unit: "unit",
  photo: "URL PHOTO",
};

const updateCreamRequestBody: UpdateCreamRequestBody = {
  name: "Test Cream Edited",
};

const creamResourcePath = "/api/v1/resources/creams";

let createSuccessBodyResponse = {};
let createUnprocessableBodyResponse = {};
let createUnauthorizedBodyResponse = {};

let getSuccessBodyResponse = {};
let getUnprocessableBodyResponse = {};
let getUnauthorizedBodyResponse = {};

let listSuccessBodyResponse = {};
let listUnprocessableBodyResponse = {};
let listUnauthorizedBodyResponse = {};

let updateSuccessBodyResponse = {};
let updateUnprocessableBodyResponse = {};
let updateUnauthorizedBodyResponse = {};

afterAll(async () => {
  await cleanCreamTestDatabase();
  await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1/resources/creams": {
        post: {
          summary: "Create Cream",
          description: "Endpoint to add a new Cream to the system.",
          tags: ["Cream"],
          requestBody: {
            description: "Cream details for creation",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: createCreamRequestBody.name,
                      require: true,
                    },
                    amount: {
                      type: "number",
                      example: createCreamRequestBody.amount,
                      require: true,
                    },
                    price: {
                      type: "number",
                      example: createCreamRequestBody.price,
                      require: true,
                    },
                    unit: {
                      type: "string",
                      example: createCreamRequestBody.unit,
                      require: true,
                    },
                    photo: {
                      type: "string",
                      example: createCreamRequestBody.photo,
                      require: false,
                    },
                  },
                  required: ["name", "amount", "price", "unit"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful creating cream",
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
          summary: "List Creams",
          parameters: [
            {
              name: "page",
              in: "query",
              description: "Page to list creams",
              required: false,
              schema: {
                type: "number",
                default: 1,
              },
            },
            {
              name: "perPage",
              in: "query",
              description: "How many creams to return per page",
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
              description: "Filter creams by some fields table",
              required: false,
              schema: {
                type: "string",
              },
              example:
                "name:like:some text here,id:some id here,price:gt:1000,amount:lt:5,createdAt:egt:some date ISO",
            },
          ],
          description:
            "Retrieve a list of creams based on optional query parameters.",
          tags: ["Cream"],
          responses: {
            "200": {
              description: "Successful getting cream",
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
          summary: "Delete Many Creams",
          parameters: [
            {
              name: "ids",
              in: "query",
              description: "ids of creams to delete",
              required: true,
              schema: {
                type: "string",
                default: "id-1,id-2",
              },
            },
          ],
          description: "Delete creams based on ids query parameter.",
          tags: ["Cream"],
          responses: {
            "204": {
              description: "Successful deleting creams",
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
      "/api/v1/resources/creams/{id}": {
        get: {
          summary: "Get Cream by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID of the Cream to retrieve",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Retrieve details of a specific Cream by its ID.",
          tags: ["Cream"],
          responses: {
            "200": {
              description: "Successful getting cream",
              content: {
                "application/json": { example: getSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: getUnprocessableBodyResponse,
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
          summary: "Update Cream",
          description: "Endpoint to update a Cream to the system.",
          tags: ["Cream"],
          requestBody: {
            description: "Cream details for updating",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: updateCreamRequestBody.name,
                    },
                    amount: {
                      type: "number",
                      example: updateCreamRequestBody.amount,
                    },
                    price: {
                      type: "number",
                      example: updateCreamRequestBody.price,
                    },
                    unit: {
                      type: "string",
                      example: updateCreamRequestBody.unit,
                    },
                    photo: {
                      type: "string",
                      example: updateCreamRequestBody.photo,
                    },
                  },
                  required: ["name", "amount", "price", "unit"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful updating cream",
              content: {
                "application/json": { example: updateSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: updateUnprocessableBodyResponse,
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
          summary: "Delete Cream",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "id of cream to delete",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description: "Delete cream based on id path parameter.",
          tags: ["Cream"],
          responses: {
            "204": {
              description: "Successful deleting cream",
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

describe("CRUD CREAM RESOURCE", () => {
  describe("TEST TO CREATE CREAM RESOURCE", () => {
    describe("CREATING CREAM AS AN ADMIN", () => {
      test(`when access POST ${creamResourcePath} authenticated as ADMIN role, create at DB a cream resource with name 'Test Cream', price '9.99', amount '1', unit 'unit' and createdBy 'Test Admin'`, async () => {
        // Verify if cream already exists
        const creamAlreadyExists = await prismaClient.cream.findUnique({
          where: { name: createCreamRequestBody.name },
        });
        // if exists, delete it
        if (creamAlreadyExists)
          await prismaClient.cream.delete({
            where: { name: createCreamRequestBody.name },
          });

        const response = await request(app)
          .post(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsAdmin}`)
          .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
          .send(createCreamRequestBody)
          .expect(200);

        createSuccessBodyResponse = response.body;

        return expect(response.statusCode).toBe(200);
      });

      test(`when access POST ${creamResourcePath} authenticated as ADMIN role and send name cream that's already exists in DB must return 422 status with message 'Unique constraint failed on the fields: name'`, async () => {
        const response = await request(app)
          .post(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsAdmin}`)
          .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
          .send(createCreamRequestBody)
          .expect(422);

        createUnprocessableBodyResponse = response.body;

        expect(response.body).toHaveProperty(
          "message",
          "Unique constraint failed on the fields: name"
        );

        return expect(response.statusCode).toBe(422);
      });
    });

    describe("CREATING CREAM AS A CLIENT", () => {
      test(`when access POST ${creamResourcePath} with authentication as CLIENT role, return 401`, async () => {
        const response = await request(app)
          .post(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsClient}`)
          .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
          .send(createCreamRequestBody)
          .expect(401);

        createUnauthorizedBodyResponse = response.body;

        return expect(response.statusCode).toBe(401);
      });
    });

    describe("CREATING CREAM AS A MEMBER", () => {
      test(`when access POST ${creamResourcePath} with authentication as member role, return 401`, async () => {
        const response = await request(app)
          .post(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsMember}`)
          .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
          .send(createCreamRequestBody)
          .expect(401);

        return expect(response.statusCode).toBe(401);
      });
    });

    describe("CREATING CREAM WITHOUT AUTHENTICATION", () => {
      test(`when access POST ${creamResourcePath} without authentication, return 401`, async () => {
        const response = await request(app)
          .post(creamResourcePath)
          .send(createCreamRequestBody)
          .expect(401);

        return expect(response.statusCode).toBe(401);
      });
    });
  });

  describe("TEST TO GET CREAM RESOURCE", () => {
    describe("GETTING CREAM AS AN ADMIN", () => {
      test(`when access GET ${creamResourcePath}/:id with authentication as ADMIN, return 200 and the cream at body reponse`, async () => {
        cream = await prismaClient.cream.findFirst({
          where: { name: "Test Cream" },
        });

        const response = await request(app)
          .get(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        getSuccessBodyResponse = response.body;

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name", cream.name);
        expect(response.body).toHaveProperty("amount", cream.amount);
        expect(response.body).toHaveProperty("id", cream.id);
        expect(response.body).toHaveProperty("available", cream.available);
        expect(response.body).toHaveProperty("unit", cream.unit);
        return expect(response.body).toHaveProperty("price", cream.price);
      });

      test(`when access GET ${creamResourcePath}/:id with authentication as ADMIN and invalid id in router, return 422 and the message 'No Cream found' in body response`, async () => {
        cream = await prismaClient.cream.findFirst({
          where: { name: "Test Cream" },
        });

        const response = await request(app)
          .get(creamResourcePath + `/invalid-id`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(422);

        getUnprocessableBodyResponse = response.body;

        return expect(response.body).toHaveProperty(
          "message",
          "No Cream found"
        );
      });
    });

    describe("GETTING CREAM AS AN CLIENT", () => {
      test(`when access GET ${creamResourcePath}/:id with authentication as CLIENT, return 200 and the cream at body reponse`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsClient)
          .set("refreshToken", "Bearer " + refreshTokenAsClient)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name", cream.name);
        expect(response.body).toHaveProperty("amount", cream.amount);
        expect(response.body).toHaveProperty("id", cream.id);
        expect(response.body).toHaveProperty("available", cream.available);
        expect(response.body).toHaveProperty("unit", cream.unit);
        return expect(response.body).toHaveProperty("price", cream.price);
      });
    });

    describe("GETTING CREAM AS AN MEMBER", () => {
      test(`when access GET ${creamResourcePath}/:id with authentication as MEMBER, return 200 and the cream at body reponse`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsMember)
          .set("refreshToken", "Bearer " + refreshTokenAsMember)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("name", cream.name);
        expect(response.body).toHaveProperty("amount", cream.amount);
        expect(response.body).toHaveProperty("id", cream.id);
        expect(response.body).toHaveProperty("available", cream.available);
        expect(response.body).toHaveProperty("unit", cream.unit);
        return expect(response.body).toHaveProperty("price", cream.price);
      });
    });

    describe("GETTING CREAM WITHOUT AUTHENTICATION", () => {
      test(`when access GET ${creamResourcePath}/:id without authentication, return 401 and the message at body reponse with 'Unauthorized: No access token provided'`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `/${cream.id}`)
          .expect(401);

        getUnauthorizedBodyResponse = response.body;

        return expect(response.statusCode).toBe(401);
      });
    });
  });

  describe("TEST TO UPDATE CREAM RESOURCE", () => {
    describe("UPDATING CREAM AS AN ADMIN", () => {
      test(`when access PUT ${creamResourcePath}/:id authenticated as ADMIN role, update at DB a cream resource with name ${createCreamRequestBody.name} to ${updateCreamRequestBody.name}`, async () => {
        const response = await request(app)
          .put(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .send(updateCreamRequestBody)
          .expect(200);

        updateSuccessBodyResponse = response.body;

        return expect(response.statusCode).toBe(200);
      });

      test(`when access PUT ${creamResourcePath}/:id authenticated as ADMIN role, update at DB the first cream resource with isSpecial false to true`, async () => {
        const firstCream = await prismaClient.cream.findFirst();
        const response = await request(app)
          .put(creamResourcePath + `/${firstCream.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .send({ isSpecial: true })
          .expect(200);

        return expect(response.statusCode).toBe(200);
      });

      test(`when access PUT ${creamResourcePath}/:id authenticated as ADMIN role, update at DB the first cream resource with available false to true`, async () => {
        const firstCream = await prismaClient.cream.findFirst();
        const response = await request(app)
          .put(creamResourcePath + `/${firstCream.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .send({ available: true })
          .expect(200);

        return expect(response.statusCode).toBe(200);
      });

      test(`when access PUT ${creamResourcePath}/:id authenticated as ADMIN role and body empty, return 422 status`, async () => {
        const response = await request(app)
          .put(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(422);

        updateUnprocessableBodyResponse = response.body;

        expect(response.body).toHaveProperty(
          "message",
          "At least one property must exist in the request body"
        );

        return expect(response.statusCode).toBe(422);
      });
    });

    describe("UPDATING CREAM AS A CLIENT OR MEMBER", () => {
      test(`when access PUT ${creamResourcePath}/:id with authentication different of 'ADMIN' role user, return 401`, async () => {
        const responseAsClient = await request(app)
          .put(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsClient)
          .set("refreshToken", "Bearer " + refreshTokenAsClient)
          .send(updateCreamRequestBody)
          .expect(401);

        updateUnauthorizedBodyResponse = responseAsClient.body;

        const responseAsMember = await request(app)
          .put(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsMember)
          .set("refreshToken", "Bearer " + refreshTokenAsClient)
          .send(updateCreamRequestBody)
          .expect(401);

        expect(responseAsMember.statusCode).toBe(401);

        return expect(responseAsClient.statusCode).toBe(401);
      });
    });

    describe("UPDATING CREAM WITHOUT AUTHENTICATION", () => {
      test(`when access PUT ${creamResourcePath}/:id without authentication, return 401`, async () => {
        const response = await request(app)
          .put(creamResourcePath + `/${cream.id}`)
          .send(updateCreamRequestBody)
          .expect(401);

        return expect(response.statusCode).toBe(401);
      });
    });
  });

  describe("TEST TO LIST AND FILTER CREAM RESOURCE", () => {
    describe("LISTING CREAM AS AN ADMIN", () => {
      test(`when access GET ${creamResourcePath} authenticated as ADMIN role, list max ten first creams`, async () => {
        const response = await request(app)
          .get(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsAdmin}`)
          .set("refreshtoken", `Bearer ${refreshTokenAsAdmin}`)
          .expect(200);

        listSuccessBodyResponse = response.body;

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("hasNextPage", true);
        expect(response.body).toHaveProperty("totalPages", 3);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(10);
      });

      test(`when access GET ${creamResourcePath}?page=2&perPage=5 authenticated as ADMIN role, list max ten first creams`, async () => {
        const response = await request(app)
          .get(creamResourcePath + "?page=2&perPage=5")
          .set("authorization", `Bearer ${accessTokenAsAdmin}`)
          .set("refreshtoken", `Bearer ${refreshTokenAsAdmin}`)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("hasNextPage", true);
        expect(response.body).toHaveProperty("totalPages", 5);
        expect(response.body).toHaveProperty("page", 2);
        return expect(response.body.data.length).toBe(5);
      });

      test(`when access GET ${creamResourcePath}?filter=invalidField:some-value authenticated as ADMIN role, the response status will be 422 and in the body as property message with 'Filter parameters not permitted'`, async () => {
        const response = await request(app)
          .get(creamResourcePath + "?filter=invalidField:some value")
          .set("authorization", `Bearer ${accessTokenAsAdmin}`)
          .set("refreshtoken", `Bearer ${refreshTokenAsAdmin}`)
          .expect(422);

        listUnprocessableBodyResponse = response.body;

        return expect(response.body).toHaveProperty(
          "message",
          "Filter parameters not permitted"
        );
      });
    });

    describe("LISTING CREAM AS A CLIENT", () => {
      test(`when access GET ${creamResourcePath} authenticated as CLIENT role, list max ten first creams`, async () => {
        const response = await request(app)
          .get(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsClient}`)
          .set("refreshtoken", `Bearer ${refreshTokenAsClient}`)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("hasNextPage");
        expect(response.body).toHaveProperty("totalPages");
        expect(response.body).toHaveProperty("page");
        expect(response.body.data.length).toBeLessThanOrEqual(10);
        return expect(response.body.page).toBe(1);
      });
    });

    describe("LISTING CREAM AS A MEMBER", () => {
      test(`when access GET ${creamResourcePath} authenticated as MEMBER role, list max ten first creams`, async () => {
        const response = await request(app)
          .get(creamResourcePath)
          .set("authorization", `Bearer ${accessTokenAsMember}`)
          .set("refreshtoken", `Bearer ${refreshTokenAsMember}`)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body).toHaveProperty("hasNextPage");
        expect(response.body).toHaveProperty("totalPages");
        expect(response.body).toHaveProperty("page");
        expect(response.body.data.length).toBeLessThanOrEqual(10);
        return expect(response.body.page).toBe(1);
      });
    });

    describe("LISTING CREAM WITHOUT AUTHENTICATION", () => {
      test(`when access GET ${creamResourcePath} without authentication, return 401 status`, async () => {
        const response = await request(app)
          .get("/api/v1/resources/creams")
          .expect(401);

        listUnauthorizedBodyResponse = response.body;

        return expect(response.statusCode).toBe(401);
      });
    });

    describe("FILTERING CREAM AS AN USER", () => {
      const nameCreamFilter = "Test to list creams 0";
      const availableTrueCreamFilter = "available:true";
      const availableFalseCreamFilter = "available:false";
      const isSpecialTrueCreamFilter = "isSpecial:true";
      const isSpecialFalseCreamFilter = "isSpecial:false";
      test(`when access GET ${creamResourcePath}?filter=name:like:${nameCreamFilter} authenticated with any role, return just one cream in data property`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `?filter=name:like:${nameCreamFilter}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toHaveProperty("name", nameCreamFilter);
        expect(response.body).toHaveProperty("hasNextPage", false);
        expect(response.body).toHaveProperty("totalPages", 1);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(1);
      });

      test(`when access GET ${creamResourcePath}?filter=${availableTrueCreamFilter} to list creams authenticated with any role, return the first cream`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `?filter=${availableTrueCreamFilter}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        const creamsWithAvailableTrue = await prismaClient.cream.count({
          where: {
            available: true,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toHaveProperty("available", true);
        expect(response.body).toHaveProperty("hasNextPage", false);
        expect(response.body).toHaveProperty("totalPages", 1);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(creamsWithAvailableTrue);
      });

      test(`when access GET ${creamResourcePath}?filter=${availableFalseCreamFilter} to list creams authenticated with any role, return all creams`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `?filter=${availableFalseCreamFilter}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(
          response.body.data.every((cream: Cream) => !cream.available)
        ).toBeTruthy();
        expect(response.body).toHaveProperty("hasNextPage", true);
        expect(response.body).toHaveProperty("totalPages", 2);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(10);
      });

      test(`when access GET ${creamResourcePath}?filter=${isSpecialTrueCreamFilter} to list creams authenticated with any role, return the first cream`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `?filter=${isSpecialTrueCreamFilter}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        const creamWithIsSpecialTrue = await prismaClient.cream.count({
          where: {
            isSpecial: true,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toHaveProperty("isSpecial", true);
        expect(
          response.body.data.every((cream: Cream) => cream.isSpecial)
        ).toBeTruthy();
        expect(response.body).toHaveProperty("hasNextPage", false);
        expect(response.body).toHaveProperty("totalPages", 1);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(creamWithIsSpecialTrue);
      });

      test(`when access GET ${creamResourcePath}?filter=${isSpecialFalseCreamFilter} to list creams authenticated with any role, return all creams`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `?filter=${isSpecialFalseCreamFilter}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(
          response.body.data.every((cream: Cream) => !cream.isSpecial)
        ).toBeTruthy();
        expect(response.body).toHaveProperty("hasNextPage", true);
        expect(response.body).toHaveProperty("totalPages", 2);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(10);
      });

      test(`when access GET ${creamResourcePath}?orderBy=name authenticated with any role, return a list cream ordered by name`, async () => {
        const response = await request(app)
          .get(creamResourcePath + `?orderBy=name`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(200);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data[0]).toHaveProperty(
          "name",
          "Test Cream Edited"
        );
        expect(response.body).toHaveProperty("hasNextPage", true);
        expect(response.body).toHaveProperty("totalPages", 3);
        expect(response.body).toHaveProperty("page", 1);
        return expect(response.body.data.length).toBe(10);
      });
    });
  });

  describe("TEST TO DELETE CREAM RESOURCE", () => {
    describe("DELETING CREAM AS AN ADMIN", () => {
      test(`when access DELETE ${creamResourcePath}/:id authenticated as ADMIN role, delete at DB a cream with id equals to id into parametter at route`, async () => {
        const response = await request(app)
          .delete(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(204);

        return expect(response.statusCode).toBe(204);
      });
    });

    describe("DELETING CREAM WITHOUT AUTHENTICATION", () => {
      test(`when access DELETE ${creamResourcePath}/:id without authentication, return 401`, async () => {
        const response = await request(app)
          .delete(creamResourcePath + `/${cream.id}`)
          .expect(401);

        return expect(response.statusCode).toBe(401);
      });
    });

    describe("DELETING CREAM AS A CLIENT OR MEMBER", () => {
      test(`when access DELETE ${creamResourcePath}/:id with authentication different of 'ADMIN' role user, return 401`, async () => {
        const responseAsClient = await request(app)
          .delete(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsClient)
          .set("refreshToken", "Bearer " + refreshTokenAsClient)
          .expect(401);

        const responseAsMember = await request(app)
          .delete(creamResourcePath + `/${cream.id}`)
          .set("authorization", "Bearer " + accessTokenAsMember)
          .set("refreshToken", "Bearer " + refreshTokenAsMember)
          .expect(401);

        expect(responseAsMember.statusCode).toBe(401);
        return expect(responseAsClient.statusCode).toBe(401);
      });
    });

    describe("DELETING MANY AS AN ADMIN", () => {
      test(
        `when an autenticated ADMIN accesses DELETE ${creamResourcePath}/deleteMany?ids=id1,id2 ` +
          "where the ids are ids of creams " +
          "should return 204 and delete all the creams thats contains the ids.",
        async () => {
          creamsToDelete = await prismaClient.cream.findMany({
            where: {
              name: {
                startsWith: "Test to list creams",
              },
            },
          });
          const response = await request(app)
            .delete(
              creamResourcePath +
                `/deleteMany?ids=${creamsToDelete
                  .map((cream) => cream.id)
                  .join(",")}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );

      test(
        `When an autenticated ADMIN accesses DELETE ${creamResourcePath}/deleteMany without ids query params` +
          "then it should return a 400 status code",
        async () => {
          const response = await request(app)
            .delete(`${creamResourcePath}/deleteMany`)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(400);

          return expect(response.statusCode).toBe(400);
        }
      );
    });

    describe("DELETING MANY AS A CLIENT", () => {
      test(
        `When an autenticated CLIENT accesses DELETE ${creamResourcePath}/deleteMany?ids=id1,id2` +
          "then it should return a 401 status code",
        async () => {
          const response = await request(app)
            .delete(
              `${creamResourcePath}/deleteMany?ids=${creamsToDelete
                .map((cream) => cream.id)
                .join(",")}`
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MANY AS A MEMBER", () => {
      test(
        `When an autenticated MEMBER accesses DELETE ${creamResourcePath}/deleteMany?ids=id1,id2` +
          "then it should return a 401 status code",
        async () => {
          const response = await request(app)
            .delete(
              `${creamResourcePath}/deleteMany?ids=${creamsToDelete
                .map((cream) => cream.id)
                .join(",")}`
            )
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MANY WITHOUT AUTHENTICATION", () => {
      test(
        `When accesses DELETE ${creamResourcePath}/deleteMany?ids=id1,id2 without authentication ` +
          "then it should return a 401 status code",
        async () => {
          const response = await request(app)
            .delete(
              `${creamResourcePath}/deleteMany?ids=${creamsToDelete
                .map((cream) => cream.id)
                .join(",")}`
            )
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });
});
