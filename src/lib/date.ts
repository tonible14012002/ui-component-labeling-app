import dayjs from "dayjs";

type DateFormat =
  | "YYYY-MM-DD HH:mm:ss"
  | "YYYY-MM-DD"
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "DD MMM YYYY, HH:mm A"

export const formatDate = (
  dateStr: string | number | Date,
  format: DateFormat
) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format(format);
};
