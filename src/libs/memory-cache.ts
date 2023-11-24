import { Cream, Role, User } from "@prisma/client";
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
