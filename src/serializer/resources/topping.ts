import { Topping } from "@prisma/client";
import { Response } from "express";

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
