import { Cream, Topping } from "@prisma/client";

export type CreateServiceOrderRequestBody = {
  name?: string;
  size: string;
  maxCreamsAllowed: number;
  maxToppingsAllowed: number;
  price: number;
  totalPrice: number;
  creams: Array<Pick<Cream, "id" | "name" | "price">>;
  toppings?: Array<Pick<Topping, "id" | "name" | "price">>;
  extras?: Array<Pick<Topping, "id" | "name" | "price">>;
};
