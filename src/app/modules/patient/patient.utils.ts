import { isValid, parse } from "date-fns";

export const convertToDateTime = (dateSting: string | undefined) => {
  if (!dateSting) {
    return undefined;
  }

  const date = parse(dateSting, "yyyy-MM-dd", new Date());

  if (!isValid(date)) {
    return undefined;
  }
  return date;
};
