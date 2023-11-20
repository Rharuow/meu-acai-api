import { Router } from "express";
import { signInRouter } from "./signIn";
import { refreshTokenRouter } from "./refreshToken";

const router = Router();

router.get("/", (_, res) => res.send("Welcome to meu açai API"));

router.use(signInRouter);
router.use(refreshTokenRouter);

export { router };
