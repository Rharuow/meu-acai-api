import { listCreamsSerializer } from "@/serializeres/resources/creams";
import { listCreams } from "@repositories/creams";
import { Request, Response } from "express";

export const listCreamController = async (
  req: Request<{}, {}, {}, qs.ParsedQs & QueryParms>,
  res: Response
) => {
  const { page, perPage } = req.query;

  try {
    const [creams, totalCreams] = await listCreams({ page, perPage });

    const totalPages = Math.ceil(totalCreams / perPage);

    return res.json(
      listCreamsSerializer({ creams, totalCreams, totalPages, page })
    );
  } catch (error) {
    console.log("creams controller = ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
