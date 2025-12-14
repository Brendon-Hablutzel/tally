import { PlanType } from "../plans";
import { TableRowType } from "../table";

export abstract class SchoolParser {
  abstract readonly transactionsIncludeInitialDeposit: boolean;

  abstract parseTransactionHistoryTable(input: string): TableRowType[];

  abstract getPlanFromAccount(
    account: string,
    firstTransactionDate: Date
  ): PlanType;

  abstract normalizePlaceName(name: string): string;

  abstract isSystemTransaction(name: string): boolean;
}
