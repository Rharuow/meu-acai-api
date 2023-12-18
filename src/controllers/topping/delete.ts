import { deleteToppingRepository } from "@repositories/topping";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";

export const deleteToppingController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteToppingRepository({ id });

    return res.status(204).send();
  } catch (error) {
    return unprocessableEntity(res, error.message);
  }
};
