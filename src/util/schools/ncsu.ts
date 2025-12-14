import dayjs from "dayjs";
import { SchoolParser } from "./parser";
import { PlanType } from "../plans";
import { TableRowType } from "../table";
import customParseFormat from "dayjs/plugin/customParseFormat";

const DATE_TIME_FORMATTER = "M/D/YY h:mm:ss A";

dayjs.extend(customParseFormat);

// NOTE: Workstation XXXX (X numbers) is used to drain remaining balance at end of year

export class NCSUParser extends SchoolParser {
  override transactionsIncludeInitialDeposit: boolean = false;

  override parseTransactionHistoryTable(tableContent: string): TableRowType[] {
    const trimmedTableContent = tableContent.trim();

    // table content may or may not have header; remove it if it is present
    const lines = trimmedTableContent
      .split("\n")
      .filter((line) => !line.startsWith("Account Name"));

    return lines.map((line) => {
      const cols = line.split("\t");

      if (cols.length !== 4) {
        throw new Error("table must have 4 columns");
      }
      const [account, whenStr, place, amountStr] = cols;

      const when = dayjs(whenStr, DATE_TIME_FORMATTER).toDate().getTime();

      const amount =
        (amountStr.includes("$")
          ? parseFloat(amountStr.substring(3))
          : parseFloat(amountStr.substring(2))) *
        (amountStr.startsWith("-") ? -1 : 1);

      return {
        account,
        when,
        place,
        amount,
      };
    });
  }

  private static getNumberFromPlanName(plan: string): number | null {
    const match = plan.match(/-?\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  override getPlanFromAccount(
    account: string,
    firstTransactionDate: Date
  ): PlanType {
    // TODO: athletic plans
    const amount = NCSUParser.getNumberFromPlanName(account);
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
  }

  override normalizePlaceName(name: string): string {
    // TODO
    return name;
  }

  override isSystemTransaction(name: string): boolean {
    return (
      name === "PatronImport Location" ||
      name.startsWith("StarRez") ||
      name.startsWith("Workstation")
    );
  }
}
