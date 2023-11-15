import { Router } from "express";

const router = Router();

router.get("/", (_, res) => res.send("Welcome to meu açai API"));

export { router };
