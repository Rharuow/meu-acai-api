import { Response } from "express";
import { Product } from "@prisma/client";
import { list } from ".";

export const createProductSerializer = ({
  res,
  product,
}: {
  res: Response;
  product: Product;
}) =>
  res.json({
    message: "Product created successfully",
    data: product,
  });

export const getProductSerializer = ({
  res,
  product,
}: {
  res: Response;
  product: Product;
}) => {
  return res.json({ message: "Product retrieved successfully", data: product });
};

type Params = {
  products: Array<Product>;
  totalPages: number;
  page: number;
};

export const listProductsSerializer = ({
  products,
  totalPages,
  page,
  res,
}: Params & { res: Response }) => {
  return res.json(list({ data: products, page, totalPages }));
};

export const updateProductSerializer = ({
  res,
  product,
}: {
  res: Response;
  product: Product;
}) => {
  return res.json({
    message: "Product updated successfully",
    data: product,
  });
};
