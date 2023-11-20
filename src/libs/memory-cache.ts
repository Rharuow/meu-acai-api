import { Role, User } from "@prisma/client";
import { MemoryCache } from "memory-cache-node";

export const userInMemory = new MemoryCache<string, User & { role?: Role }>(
  process.env.NODE_ENV === "test" ? 5 : 3600, // time in seconds to expire items
  100 // number of items
);
