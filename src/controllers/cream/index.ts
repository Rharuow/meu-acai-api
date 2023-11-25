import { unprocessableEntity } from "@serializer/erros/422";
import { listCreamsSerializer } from "@serializer/resources/creams";
import { listCreams } from "@repositories/creams";
import { Request, Response } from "express";
import { QueryParms } from "@/types/queryParams/pagination";

export const listCreamController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response
) => {
  const { page, perPage, orderBy, filter } = req.query;

  try {
    const [creams, totalCreams] = await listCreams({
      page,
      perPage,
      orderBy,
      filter,
    });

    const totalPages = Math.ceil(totalCreams / perPage);

    return res.json(listCreamsSerializer({ creams, totalPages, page }));
  } catch (error) {
    console.log("creams controller = ", error);
    return unprocessableEntity(res, { message: error.message });
  }
};
