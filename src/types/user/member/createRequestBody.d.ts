export type CreateMemberRequestBody = {
  userId: string;
  clientId: string;
  email?: string;
  phone?: string;
  relationship?: string;
};
