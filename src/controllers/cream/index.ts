import { prismaClient } from "@libs/prisma";
import { Request, Response } from "express";

type QueryParms = { page: number; perPage: number };

export const listCreamController = async (
  req: Request<{}, {}, {}, QueryParms>,
  res: Response
) => {
  const { page = 1, perPage = 10 } = req.query;

  try {
    const [creams, totalCreams] = await Promise.all([
      await prismaClient.cream.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      await prismaClient.cream.count(),
    ]);

    const totalPages = Math.ceil(totalCreams / perPage);

    return res.json({
      data: creams,
      hasNextPage: creams.length < totalCreams,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.log("creams controller = ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
