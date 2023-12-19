import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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
    if (error instanceof PrismaClientKnownRequestError)
      return unprocessableEntity(res, error.meta.cause);

    return unprocessableEntity(res, error.message);
  }
};
