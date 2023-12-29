import "dotenv/config";
import request from "supertest";

import { app } from "@/app";
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";

afterAll(async () => {
  await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1": {
        get: {
          summary: "Welcome router",
          description: "This router return the 'welcome'",
          tags: ["Wellcome"],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  example: {
                    message: "Welcome to meu açai API",
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

describe("Welcome router", () => {
  it("should return 'Welcome to meu açai API' message", async () => {
    const response = await request(app).get("/api/v1").expect(200);
    return expect(response.text).toBe("Welcome to meu açai API");
  });
});
