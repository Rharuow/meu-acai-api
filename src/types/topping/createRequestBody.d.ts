import { Topping } from "@prisma/client";

export type CreateToppingRequestBody = {
  name: Topping["name"];
  amount: Topping["amount"];
  price: Topping["price"];
  adminId: Topping["adminId"];
  available?: Topping["available"];
  isSpecial?: Topping["isSpecial"];
  photo?: Topping["photo"];
  unit?: Topping["unit"];
};
