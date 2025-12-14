import { z } from "zod";
import { SchoolParser } from "./schools/parser";

export const Plan = z.object({
  planStart: z.date(),
  planEnd: z.date(),
  totalAmount: z.number(),
});

export type PlanType = z.infer<typeof Plan>;

export const canGetPlanFromAccount = (
  schoolParser: SchoolParser,
  account: string,
  firstTransactionDate: Date
) => {
  try {
    schoolParser.getPlanFromAccount(account, firstTransactionDate);
    return true;
  } catch {
    return false;
  }
};
