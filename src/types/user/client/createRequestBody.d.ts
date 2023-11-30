import { Address } from "@prisma/client";

export type CreateClientRequestBody = {
  userId: string;
  address: Address;
};
