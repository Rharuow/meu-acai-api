import { CreateUserRequestBody } from "../createRequestbody";

export type CreateMemberRequestBody = {
  clientId: string;
  email?: string;
  phone?: string;
  relationship?: string;
} & CreateUserRequestBody;
