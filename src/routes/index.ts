import { Router } from "express";
import { signInRouter } from "./signIn";

const router = Router();

router.get("/", (_, res) => res.send("Welcome to meu açai API"));

router.use(signInRouter);

export { router };
