import { deleteManyUser, deleteUser } from "@repositories/user";
import { badRequest } from "@serializer/erros/400";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteUser({ id });

    return res.status(204).send("cream is deleted");
  } catch (error) {
    console.log("error: " + error);
    return unprocessableEntity(res);
  }
};

export const deleteManyUsersController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & { resourceIds: Array<string> }>,
  res: Response
) => {
  const { resourceIds } = req.query;

  try {
    await deleteManyUser({ ids: resourceIds });
    return res.status(204).send("cream is deleted");
  } catch (error) {
    return badRequest({ res });
  }
};
