import { updateToppingRepository } from "@repositories/topping";
import { UpdateToppingRequestBody } from "./../../types/topping/updateRequestBody.d";
import { Request, Response } from "express";
import { updateToppingSerializer } from "@serializer/resources/topping";
import { badRequest } from "@serializer/erros/400";

export const updateToppingController = async (
  req: Request<{ id: string }, {}, UpdateToppingRequestBody, {}>,
  res: Response
) => {
  try {
    const topping = await updateToppingRepository({
      data: req.body,
      id: req.params.id,
    });

    return updateToppingSerializer({ res, topping });
  } catch (error) {
    return badRequest({
      res,
      message: "Error updating topping = " + error.message,
    });
  }
};
