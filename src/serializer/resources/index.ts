export const list = <T>({
  data,
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
  data: Array<T>;
}) => {
  return {
    data,
    hasNextPage: page < totalPages,
    page,
    totalPages,
  };
};
