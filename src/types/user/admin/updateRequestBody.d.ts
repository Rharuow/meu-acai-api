import { Admin, User } from "@prisma/client";

export type UpdateAdminRequestBody = Partial<User & Admin>;
