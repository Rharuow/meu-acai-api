import { createMember } from "@repositories/user/member";
import { createMemberSerializer } from "@serializer/resources/user/member";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";
import { Prisma, User } from "@prisma/client";
import { CreateMemberRequestBody } from "@/types/user/member/createRequestBody";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";

export const createMemberController = async (
  req: Request<{}, {}, CreateMemberRequestBody & CreateUserRequestBody, {}>,
  res: Response
) => {
  try {
    const member = await createMember(req.body);

    return createMemberSerializer({ res, user: member });
  } catch (error) {
    console.error("Error creating member = ", error);
    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const { clientVersion, ...errorSanitized } = error;
      // Handle the unique constraint violation error here
      return unprocessableEntity(res, {
        errorSanitized,
        message: `Unique constraint failed on the fields: ${errorSanitized.meta.target}`,
      });
    } else {
      // Handle other errors
      return unprocessableEntity(res, { message: error.message });
    }
  }
};
