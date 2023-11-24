import { getCream } from "@repositories/creams";
import { Request, Response } from "express";

export const getCreamController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const cream = await getCream({ id });

    return res.json(cream);
  } catch (error) {
    console.log("get cream error", error);
    return res.status(500);
  }
};
