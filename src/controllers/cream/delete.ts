import { unprocessableEntity } from "@serializer/erros/422";
import { deleteCream, deleteManyCreams } from "@repositories/creams";
import { Request, Response } from "express";
import { badRequest } from "@serializer/erros/400";

export const deleteCreamController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteCream({ id });

    return res.status(204).send("cream is deleted");
  } catch (error) {
    return unprocessableEntity(res, { message: error.message });
  }
};

export const deleteManyCreamsController = async (
  req: Request<{}, {}, {}, { resourceIds: Array<string> } & qs.ParsedQs>,
  res: Response
) => {
  const { resourceIds } = req.query;
  try {
    await deleteManyCreams({ ids: resourceIds });
    return res.status(204).send("creams deleted successfully");
  } catch (error) {
    return badRequest({ res });
  }
};
