export type Params = {
  page: number;
  perPage: number;
  orderBy: string;
  filter?: string;
  customFilter?: {};
};

type WhereType = {
  [key: string]: string | boolean | { contains: string };
};

const parseValue = (
  operator: string,
  value: string
): string | boolean | { contains: string } => {
  if (operator === "like") {
    return { contains: value };
  } else if (operator === "true") {
    return true;
  } else if (operator === "false") {
    return false;
  } else {
    return value;
  }
};

export const createQuery = ({ filterFields }: { filterFields: string[] }) => {
  const where: WhereType = {};
  if (filterFields)
    filterFields.forEach((filter) => {
      const [key, operator, value] = filter.split(":");
      where[key] = parseValue(operator, value);
    });

  return where;
};

export const createReferenceMemoryCacheQuery = ({
  params,
  referenceString,
}: {
  referenceString: string;
  params: Params & { query?: string };
}) => {
  referenceString = referenceString.concat(
    "-",
    String(params.page),
    "-",
    String(params.perPage),
    "-",
    String(params.orderBy),
    "-",
    String(params.filter),
    "-",
    String(params.query)
  );

  return referenceString;
};

export const createOrder = ({
  fieldOrderBy,
  order,
}: {
  fieldOrderBy: string;
  order: string;
}) => ({
  [fieldOrderBy]: order || "asc",
});
