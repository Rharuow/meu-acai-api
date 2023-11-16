import { signIn } from "@/controller/signIn";
import { Router } from "express";

const signInRouter = Router();

signInRouter.post("/signgin", signIn);

export { signInRouter };
