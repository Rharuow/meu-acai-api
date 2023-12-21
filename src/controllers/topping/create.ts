import { CreateToppingRequestBody } from "@/types/topping/createRequestBody";
import { createToppingRepository } from "@repositories/topping";
import { badRequest } from "@serializer/erros/400";
import { createToppingSerializer } from "@serializer/resources/topping";
import { Request, Response } from "express";

export const createToppingController = async (
  req: Request<{}, {}, CreateToppingRequestBody, qs.ParsedQs>,
  res: Response
) => {
  try {
    const data = req.body;

    const topping = await createToppingRepository(data);

    return createToppingSerializer({ res, topping });
  } catch (error) {
    console.error("Error creating topping controller = ", error);
    return badRequest({
      res,
      message: "Error creating topping = " + error.message,
    });
  }
};
