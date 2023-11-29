import { Request, Response } from "express";

import { QueryParms } from "@/types/queryParams/pagination";
import { ParamsUser, listUsers } from "@repositories/user";
import { listUsersSerializer } from "@serializer/resources/user";
import { unprocessableEntity } from "@serializer/erros/422";

export const listUserController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response
) => {
  const { page, perPage, orderBy, filter, includes } = req.query as ParamsUser;

  try {
    const [users, totalUsers] = await listUsers({
      page,
      perPage,
      orderBy,
      filter,
      ...(includes && { includes }),
    });

    const totalPages = Math.ceil(totalUsers / perPage);

    return res.json(listUsersSerializer({ users, totalPages, page }));
  } catch (error) {
    return unprocessableEntity(res, { message: error.message });
  }
};
