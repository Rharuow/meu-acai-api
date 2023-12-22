import { Topping } from "@prisma/client";
import { Response } from "express";
import { list } from ".";

export const createToppingSerializer = ({
  res,
  topping,
}: {
  res: Response;
  topping: Topping;
}) =>
  res.json({
    message: "Topping created successfully",
    data: topping,
  });

export const getToppingSerializer = ({
  res,
  topping,
}: {
  res: Response;
  topping: Topping;
}) => {
  return res.json({ message: "Topping retrieved successfully", data: topping });
};

type Params = {
  toppings: Array<Topping>;
  totalPages: number;
  page: number;
};

export const listToppingsSerializer = ({
  toppings,
  totalPages,
  page,
  res,
}: Params & { res: Response }) => {
  return res.json(list({ data: toppings, page, totalPages }));
};

export const updateToppingSerializer = ({
  res,
  topping,
}: {
  res: Response;
  topping: Topping;
}) => {
  return res.json({
    message: "Topping updated successfully",
    data: topping,
  });
};
