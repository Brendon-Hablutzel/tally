import dayjs from "dayjs";

export const roundToHundredth = (n: number): number => {
  return Math.round(n * 100) / 100;
};

export const daysBetween = (date1: Date, date2: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;

  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());

  return Math.floor((utc2 - utc1) / msPerDay) + 1;
};

export const formatDate = (date: Date) => {
  return dayjs(date).format("MMMM D, YYYY");
};

export const formatDateShort = (date: Date) => {
  return dayjs(date).format("MMM D, YY");
};

export const addDays = (date: Date, n: number): Date => {
  const result = new Date(date); // clone to avoid mutating original
  result.setDate(result.getDate() + n);
  return result;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
