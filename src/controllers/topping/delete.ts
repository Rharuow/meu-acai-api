import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  deleteManyToppingsRepository,
  deleteToppingRepository,
} from "@repositories/topping";
import { badRequest } from "@serializer/erros/400";
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

export const deleteManyToppingsController = async (
  req: Request<{}, {}, {}, { resourceIds: Array<string> } & qs.ParsedQs>,
  res: Response
) => {
  const { resourceIds } = req.query;
  try {
    await deleteManyToppingsRepository({ ids: resourceIds });
    return res.status(204).send("toppings deleted successfully");
  } catch (error) {
    return badRequest({ res });
  }
};
