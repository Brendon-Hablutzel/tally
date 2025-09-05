import { z } from "zod";

export const Plan = z.object({
  planStart: z.date(),
  planEnd: z.date(),
  totalAmount: z.number(),
});

export type PlanType = z.infer<typeof Plan>;

const getNumberFromPlanName = (plan: string): number | null => {
  const match = plan.match(/-?\d+/);
  return match ? parseInt(match[0], 10) : null;
};

export const getPlanFromAccount = (
  account: string,
  firstTransactionDate: Date
): PlanType => {
  // TODO: athletic plans
  const amount = getNumberFromPlanName(account);
  if (amount == null) {
    // TODO: handle this in the view
    throw new Error(`no number found in plan name: ${account}`);
  }

  // NOTE: this uses local time (user is probably in eastern, so this is probably fine)
  const firstTransactionYear = firstTransactionDate.getFullYear();

  // TODO: check all these dates
  let planStart: Date;
  let planEnd: Date;
  const term = account.split(" ")[0];
  if (term === "Spring") {
    planStart = new Date(firstTransactionYear, 0, 5);
    planEnd = new Date(firstTransactionYear, 4, 10);
  } else if (term === "Fall") {
    planStart = new Date(firstTransactionYear, 7, 11);
    planEnd = new Date(firstTransactionYear, 11, 11);
  } else if (term === "Summer") {
    planStart = new Date(firstTransactionYear, 4, 11);
    planEnd = new Date(firstTransactionYear, 7, 9);
  } else {
    throw new Error(`invalid term: ${term}`);
  }

  return {
    totalAmount: amount,
    planStart,
    planEnd,
  };
};

export const canGetPlanFromAccount = (
  account: string,
  firstTransactionDate: Date
) => {
  try {
    getPlanFromAccount(account, firstTransactionDate);
    return true;
  } catch {
    return false;
  }
};
