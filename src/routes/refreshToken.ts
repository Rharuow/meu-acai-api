import { refreshTokenController } from "@controllers/refreshToken";
import { verifyAccessToken } from "@middlewares/refreshToken/verifyAccessToken";
import { Router } from "express";

const refreshTokenRouter = Router();

refreshTokenRouter.use("/refresh-token", verifyAccessToken);

refreshTokenRouter.post("/refresh-token", refreshTokenController);

export { refreshTokenRouter };
