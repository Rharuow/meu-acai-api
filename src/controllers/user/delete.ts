import { deleteManyUser, deleteUser } from "@repositories/user";
import { badRequest } from "@serializer/erros/400";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";

export const deleteUserController = async (req: Request, res: Response) => {
  const { id, userId } = req.params;

  try {
    await deleteUser({ id: userId || id });

    return res.status(204).send("user is deleted");
  } catch (error) {
    return unprocessableEntity(res, "Error deleting user " + error.message);
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
