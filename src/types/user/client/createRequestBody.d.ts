import { Address } from "@prisma/client";

export type CreateClientRequestBody = {
  userId: string;
  address: { house: Address["house"]; square: Address["square"] };
};
