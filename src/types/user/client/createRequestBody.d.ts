import { Address } from "@prisma/client";

export type CreateClientRequestBody = {
  address: { house: Address["house"]; square: Address["square"] };
  email?: string;
  phone?: string;
};
