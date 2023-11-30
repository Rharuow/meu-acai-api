import { unprocessableEntity } from "@serializer/erros/422";
import { deleteCream } from "@repositories/creams";
import { Request, Response } from "express";

export const deleteCreamController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteCream({ id });

    return res.status(204).send("cream is deleted");
  } catch (error) {
    return unprocessableEntity(res, { message: error.message });
  }
};
