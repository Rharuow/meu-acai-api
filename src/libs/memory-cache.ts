import {
  Admin,
  Client,
  Cream,
  Member,
  Role,
  Topping,
  User,
} from "@prisma/client";
import { MemoryCache } from "memory-cache-node";

export const userInMemory = new MemoryCache<string, User & { role?: Role }>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
  100 // number of items
);

export const creamsInMemory = new MemoryCache<string, Array<Cream>>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
  100 // number of items
);

export const creamInMemory = new MemoryCache<string, Cream>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60,
  10
);

export const totalCreamsInMemory = new MemoryCache<string, number>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
  100 // number of items
);

export const toppingsInMemory = new MemoryCache<string, Array<Topping>>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
  100 // number of items
);

export const toppingInMemory = new MemoryCache<string, Topping>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60,
  10
);

export const totalToppingsInMemory = new MemoryCache<string, number>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
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
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
  100 // number of items
);

export const totalUsersInMemory = new MemoryCache<string, number>(
  process.env.NODE_ENV === "test" ? 5 : 60 * 60, // 1 hour to expire items
  100 // number of items
);
