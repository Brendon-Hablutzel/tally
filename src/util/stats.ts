import { addDays, daysBetween, isSameDay, roundToHundredth } from ".";
import { PlanType } from "./plans";
import { TableType } from "./table";

// NOTE: Workstation XXXX (X numbers) is used to drain remaining balance at end of year

const getPlaceAmounts = (rows: TableType): Record<string, number> => {
  const places: Record<string, number> = {};

  for (const row of rows) {
    const place = row.place;

    if (place in places) {
      places[place] += row.amount;
    } else {
      places[place] = row.amount;
    }
  }

  for (const entry of Object.entries(places)) {
    places[entry[0]] = roundToHundredth(entry[1]);
  }

  return places;
};

export const getPlaceStats = (
  rows: TableType
): {
  byPlace: Record<string, number>;
  top: {
    name: string | undefined;
    used: number;
  };
} => {
  const nonImportRows = rows
    .filter((row) => row.place !== "PatronImport Location")
    .filter((row) => !row.place.startsWith("Workstation"))
    .map((row) => ({
      ...row,
      amount: -1 * row.amount,
    }));

  // const byPlace = getPlaceFrequencies(rows);
  const byPlace = getPlaceAmounts(nonImportRows);

  const [topName, topUsage] = Object.entries(byPlace).reduce(
    (prev, curr) => {
      const [, prevUsage] = prev;
      const [, currUsage] = curr;

      return currUsage > prevUsage ? curr : prev;
    },
    ["", 0]
  );

  return {
    byPlace,
    top: {
      name: topName,
      used: topUsage,
    },
  };
};

export const getAggregateUsageStats = (
  rows: TableType
): {
  importedAmount: number;
  nonImportedAmount: number;
} => {
  const importRows = rows.filter(
    (row) => row.place === "PatronImport Location"
  );
  const nonImportRows = rows.filter(
    (row) => row.place !== "PatronImport Location"
  );

  const importedAmount = roundToHundredth(
    importRows.reduce((prev, curr) => prev + curr.amount, 0)
  );

  const nonImportedAmount = roundToHundredth(
    nonImportRows.reduce((prev, curr) => prev - curr.amount, 0)
  );

  return {
    importedAmount,
    nonImportedAmount,
  };
};

export const getForecastStats = (
  rows: TableType,
  plan: PlanType,
  totalStartAmount: number,
  used: number
): {
  daysSinceBegin: number;
  currentRate: number;
  requiredRate: number;
  remainingDaysAtCurrentRate: number;
} => {
  const balance = totalStartAmount - used;

  const now = new Date();
  const daysSinceBegin = Math.min(
    daysBetween(plan.planStart, now),
    daysBetween(plan.planStart, plan.planEnd)
  );
  const daysUntilEnd = daysBetween(now, plan.planEnd);
  const currentRate = used / daysSinceBegin;
  const requiredRate = balance / daysUntilEnd;

  const lastTransaction = new Date(Math.max(...rows.map((row) => row.when)));
  const remainingDaysAtCurrentRate =
    balance === 0 ? daysBetween(now, lastTransaction) : balance / currentRate;

  return {
    daysSinceBegin,
    currentRate,
    requiredRate,
    remainingDaysAtCurrentRate,
  };
};

const getUsageOverTime = (
  rows: TableType,
  totalStartAmount: number,
  startDate: Date,
  endDate: Date
): {
  day: Date;
  actualRemaining?: number;
  idealRemaining: number;
}[] => {
  const daysDuration = daysBetween(startDate, endDate);
  const idealRate = totalStartAmount / daysDuration;

  const usageOverTime = [];

  let actualRemaining = totalStartAmount;
  let idealRemaining = totalStartAmount;
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // clone date to avoid keeping reference to original
    usageOverTime.push({
      day: new Date(currentDate),
      actualRemaining,
      idealRemaining,
    });

    const totalUsedToday = rows
      .filter((row) => isSameDay(new Date(row.when), currentDate))
      .reduce((prev, curr) => prev - curr.amount, 0);

    idealRemaining -= idealRate;
    actualRemaining -= totalUsedToday;
    currentDate = addDays(currentDate, 1);
  }

  return usageOverTime;
};

export const getTrendStats = (
  rows: TableType,
  plan: PlanType,
  totalStartAmount: number,
  used: number
): {
  usageOverTime: {
    day: Date;
    actualRemaining?: number;
    idealRemaining: number;
  }[];
  currentRate: number;
  idealRate: number;
} => {
  const usageOverTime = getUsageOverTime(
    rows,
    totalStartAmount,
    plan.planStart,
    plan.planEnd
  );

  const now = new Date();
  const daysSinceBegin = Math.min(
    daysBetween(plan.planStart, now),
    daysBetween(plan.planStart, plan.planEnd)
  );

  const planDurationDays = daysBetween(plan.planStart, plan.planEnd);
  const currentRate = used / daysSinceBegin;
  const idealRate = totalStartAmount / planDurationDays;

  return {
    usageOverTime,
    currentRate,
    idealRate,
  };
};
