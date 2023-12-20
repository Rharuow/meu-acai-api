import { QueryParms } from "@/types/queryParams/pagination";
import { listToppingRepository } from "@repositories/topping";
import { unprocessableEntity } from "@serializer/erros/422";
import { listToppingsSerializer } from "@serializer/resources/topping";
import { Request, Response } from "express";

export const listToppingsController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response
) => {
  const { page, perPage, orderBy, filter } = req.query;

  try {
    const [toppings, totalToppings] = await listToppingRepository({
      orderBy,
      filter,
      page,
      perPage,
    });
    const totalPages = Math.ceil(totalToppings / perPage);

    return listToppingsSerializer({ page, res, toppings, totalPages });
  } catch (error) {
    return unprocessableEntity(
      res,
      "error listing toppings = " + error.message
    );
  }
};
