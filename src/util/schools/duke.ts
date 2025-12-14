import dayjs from "dayjs";
import { SchoolParser } from "./parser";
import { PlanType } from "../plans";
import { TableRowType } from "../table";
import customParseFormat from "dayjs/plugin/customParseFormat";

const DATE_TIME_FORMATTER = "M/D/YYYY h:mm A";

dayjs.extend(customParseFormat);

export class DukeParser extends SchoolParser {
  // TODO: finish and check
  private static readonly planToAmount: Record<string, number> = {
    "RA Food": 1788,
  };

  override transactionsIncludeInitialDeposit: boolean = true;

  override parseTransactionHistoryTable(tableContent: string): TableRowType[] {
    const trimmedTableContent = tableContent.trim();

    // NOTE: assuming no header
    const lines = trimmedTableContent.split("\n");

    return lines.map((line) => {
      const cols = line.split("\t");

      if (cols.length !== 6) {
        throw new Error("table must have 6 columns");
      }

      // sign being "Debit" or "Credit"
      const [whenStr, account, , place, signStr, amountStr] = cols;

      const when = dayjs(whenStr, DATE_TIME_FORMATTER).toDate().getTime();

      // amount looks like this: `(9.66) USD`
      const absoluteAmount = parseFloat(
        amountStr.replace("(", "").replace(",", "")
      );

      const sign = signStr === "Debit" ? -1 : 1;

      return {
        account,
        when,
        place,
        amount: sign * absoluteAmount,
      };
    });
  }

  override getPlanFromAccount(
    account: string,
    firstTransactionDate: Date
  ): PlanType {
    // NOTE: this uses local time (user is probably in eastern, so this is probably fine)
    const firstTransactionYear = firstTransactionDate.getFullYear();
    const firstTransactionMonth = firstTransactionDate.getMonth();

    // TODO: check all these dates
    let planStart: Date;
    let planEnd: Date;
    if (firstTransactionMonth === 0) {
      planStart = new Date(firstTransactionYear, 0, 5);
      planEnd = new Date(firstTransactionYear, 4, 10);
    } else if (firstTransactionMonth === 7) {
      planStart = new Date(firstTransactionYear, 7, 11);
      planEnd = new Date(firstTransactionYear, 11, 11);
    } else {
      throw new Error(
        `invalid term; started in month: ${firstTransactionMonth}`
      );
    }

    return {
      totalAmount: DukeParser.planToAmount[account],
      planStart,
      planEnd,
    };
  }

  override normalizePlaceName(name: string): string {
    if (name.startsWith("Vending")) {
      // TODO: may want to leave some place information
      return "Vending";
    } else {
      // names look like: "Ginger and Soy GINReg2"
      const split = name.split(" ");
      split.pop();
      return split.join(" ");
    }
  }

  override isSystemTransaction(name: string): boolean {
    // TODO
    return name.startsWith("DukeCard Offices Cust Srvc");
  }
}
