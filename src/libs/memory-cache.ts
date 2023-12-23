import {
  Admin,
  Client,
  Cream,
  Member,
  Product,
  Role,
  Topping,
  User,
} from "@prisma/client";
import { MemoryCache } from "memory-cache-node";

const TIMETOEXPIRECACHE = process.env.NODE_ENV === "test" ? 5 : 60 * 60; // 1 hour to expire items

export const userInMemory = new MemoryCache<string, User & { role?: Role }>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const creamsInMemory = new MemoryCache<string, Array<Cream>>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const creamInMemory = new MemoryCache<string, Cream>(
  TIMETOEXPIRECACHE,
  10
);

export const totalCreamsInMemory = new MemoryCache<string, number>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const toppingsInMemory = new MemoryCache<string, Array<Topping>>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const toppingInMemory = new MemoryCache<string, Topping>(
  TIMETOEXPIRECACHE,
  10
);

export const totalToppingsInMemory = new MemoryCache<string, number>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const productsInMemory = new MemoryCache<string, Array<Product>>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const productInMemory = new MemoryCache<string, Product>(
  TIMETOEXPIRECACHE,
  10
);

export const totalProductsInMemory = new MemoryCache<string, number>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const usersInMemory = new MemoryCache<
  string,
  Array<
    User & { role?: Role } & { admin?: Admin } & { member?: Member } & {
      client?: Client;
    }
  >
>(
  TIMETOEXPIRECACHE,
  100 // number of items
);

export const totalUsersInMemory = new MemoryCache<string, number>(
  TIMETOEXPIRECACHE,
  100 // number of items
);
