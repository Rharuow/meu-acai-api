import { Cream } from "@prisma/client";
import { list } from ".";
import { Response } from "express";

export type ListCreamsSerializer = {
  data: Array<Cream>;
  hasNextPage: boolean;
  page: number;
  totalPages: number;
};

type Params = {
  creams: Array<Cream>;
  totalPages: number;
  page: number;
};

export const listCreamsSerializer = ({
  creams,
  totalPages,
  page,
  res,
}: Params & { res: Response }) => {
  return res.json(list({ data: creams, page, totalPages }));
};

export const createCreamSerializer = (cream: Cream) => ({
  message: "Cream created successfully",
  data: cream,
});

export const updateCreamSerializer = (cream: Cream) => ({
  message: "Cream updated successfully",
  data: cream,
});
