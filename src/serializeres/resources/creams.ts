import { Cream } from "@prisma/client";

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
  totalCreams: number;
};

export const listCreamsSerializer: (params: Params) => ListCreamsSerializer = ({
  creams,
  totalPages,
  page,
  totalCreams,
}) => {
  return {
    data: creams,
    hasNextPage: creams.length < totalCreams,
    page,
    totalPages,
  };
};

export const createCreamSerializer = (cream: Cream) => ({
  message: "Cream created successfully",
  data: cream,
});

export const updateCreamSerializer = (cream: Cream) => ({
  message: "Cream updated successfully",
  data: cream,
});
