import { CreateUserRequestBody } from "../createRequestbody";

export type CreateAdminRequestBody = {
  email?: string;
  phone?: string;
} & CreateUserRequestBody;
