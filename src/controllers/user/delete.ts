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
    console.error("error deleting user", error.message);
    return unprocessableEntity(res);
  }
};

export const deleteManyUsersController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & { usersIds: Array<string> }>,
  res: Response
) => {
  const { usersIds } = req.query;

  try {
    await deleteManyUser({ ids: usersIds });
    return res.status(204).send("cream is deleted");
  } catch (error) {
    console.error("error deleting many users", error.message);
    return badRequest({ res });
  }
};
