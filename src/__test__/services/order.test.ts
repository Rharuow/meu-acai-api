import { app } from "@/app";
import request from "supertest";
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";
import {
  cleanServiceOrderTestDatabase,
  presetToServiceOrderTests,
} from "../presets/services/order";
import { CreateServiceOrderRequestBody } from "@/types/services/order/createRequestbody";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

beforeAll(async () => {
  const { userAdmin, userClient, userMember } =
    await presetToServiceOrderTests();

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

  accessTokenAsAdmin = "Bearer " + responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = "Bearer " + responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = "Bearer " + responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = "Bearer " + responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = "Bearer " + responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = "Bearer " + responseSignInAsMember.body.refreshToken;
});

const createServiceOrderRequestBody: Omit<
  CreateServiceOrderRequestBody,
  "adminId"
> = {
  name: "Test ServiceOrder",
  price: 9.99,
  paymentMethod: "card",
  isPaid: true,
  creams: Array(2)
    .fill(null)
    .map((cream, index) => ({
      id: String(index),
      name: "Cream test",
      price: 9.99,
    })),
  maxCreamsAllowed: 2,
  maxToppingsAllowed: 3,
  size: "Size test",
  totalPrice: 99.99,
  extras: Array(2)
    .fill(null)
    .map((extra, index) => ({
      id: String(index),
      name: "Extra test",
      price: 9.99,
    })),
  toppings: Array(3)
    .fill(null)
    .map((topping, index) => ({
      id: String(index),
      name: "Topping test",
      price: 9.99,
    })),
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
  await cleanServiceOrderTestDatabase();
});

const basePath = "/api/v1/services/orders";
const setIdInBasePath = (id: string) => `/api/v1/services/orders/${id}`;

describe("SERVICE ORDER TESTS", () => {
  describe("CREATE SERVICE ORDER", () => {
    test(
      `When an Admin access POST ${basePath}` +
        " sending in the body request the valid params name, price, creams, maxCreamsAllowed, maxToppingsAllowed, size, paymentMethod, isPaid, totalPrice, extras and toppings" +
        " the response body is 200 and a message property that will be 'Order created successfully'",
      async () => {
        const response = await request(app)
          .post(basePath)
          .send(createServiceOrderRequestBody)
          .set("Authorization", accessTokenAsAdmin)
          .set("refreshToken", refreshTokenAsAdmin)
          .expect(200);

        return expect(response.body).toHaveProperty(
          "message",
          "Order created successfully"
        );
      }
    );
  });
});
