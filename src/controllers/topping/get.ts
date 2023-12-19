import { getToppingRepository } from "@repositories/topping";
import { unprocessableEntity } from "@serializer/erros/422";
import { getToppingSerializer } from "@serializer/resources/topping";
import { Request, Response } from "express";

export const getToppingController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) => {
  const { id } = req.params;

  try {
    const topping = await getToppingRepository({ id });
    return getToppingSerializer({ res, topping });
  } catch (error) {
    return unprocessableEntity(
      res,
      "Error to retrivier topping: " + error.message
    );
  }
};
