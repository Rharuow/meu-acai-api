import "dotenv/config";
import { app } from "@/app";
import request from "supertest";

describe("Welcome router", () => {
  it("should return 'Welcome to meu açai API' message", async () => {
    const response = await request(app).get("/api/v1").expect(200);
    return expect(response.text).toBe("Welcome to meu açai API");
  });
});
