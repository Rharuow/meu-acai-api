import { QueryParms } from "@/types/queryParams/pagination";
import { listProductsRepository } from "@repositories/products";
import { unprocessableEntity } from "@serializer/erros/422";
import { listProductsSerializer } from "@serializer/resources/product";
import { Request, Response } from "express";

export const listProductsController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response
) => {
  const { page, perPage, orderBy, filter } = req.query;

  try {
    const [products, totalProducts] = await listProductsRepository({
      orderBy,
      filter,
      page,
      perPage,
    });
    const totalPages = Math.ceil(totalProducts / perPage);

    return listProductsSerializer({ page, res, products, totalPages });
  } catch (error) {
    return unprocessableEntity(
      res,
      "error listing products = " + error.message
    );
  }
};
