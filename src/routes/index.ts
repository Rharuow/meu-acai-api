import { Router } from "express";
import { signInRouter } from "./signIn";
import { refreshTokenRouter } from "./refreshToken";
import { resourcesRouter } from "./resources";

const router = Router();

router.get("/", (_, res) => res.send("Welcome to meu açai API"));

router.use(signInRouter);
router.use(refreshTokenRouter);
router.use(resourcesRouter);

export { router };
