import { z } from "zod";

export const TableRow = z.object({
  // TODO: perhaps split into term and type
  account: z.string(),
  when: z.number(), // epoch timestamp milliseconds
  place: z.string(),
  amount: z.number(),
});

export type TableRowType = z.infer<typeof TableRow>;

export const Table = z.array(TableRow);

export type TableType = z.infer<typeof Table>;

export const parseInputTransactionHistoryTable = (
  tableContent: string
): TableRowType[] => {
  const trimmedTableContent = tableContent.trim();

  // table content may or may not have header
  const lines = trimmedTableContent
    .split("\n")
    .filter((line) => !line.startsWith("Account Name"));

  return lines.map((line) => {
    const cols = line.split("\t");

    if (cols.length !== 4) {
      throw new Error("table must have 4 columns");
    }
    const [account, whenStr, place, amountStr] = cols;

    const when = new Date(whenStr);
    const amount =
      (amountStr.includes("$")
        ? parseFloat(amountStr.substring(3))
        : parseFloat(amountStr.substring(2))) *
      (amountStr.startsWith("-") ? -1 : 1);

    return {
      account,
      when: when.getTime(),
      place,
      amount,
    };
  });
};

export const encodeParsedTable = (table: TableRowType[]): string => {
  return btoa(JSON.stringify(table));
};

export const decodeTableString = (
  base64Table: string
):
  | {
      success: true;
      data: TableType;
    }
  | {
      success: false;
      error: string;
    } => {
  try {
    const decoded = atob(base64Table);

    const parsedJson = JSON.parse(decoded);

    console.log(parsedJson);

    const table = Table.safeParse(parsedJson);

    if (table.success) {
      return table;
    } else {
      return {
        success: false,
        error: table.error.message,
      };
    }
  } catch (e) {
    return {
      success: false,
      error: `${e}`,
    };
  }
};

export const tableToAccountTables = (
  table: TableType
): Record<string, TableType> => {
  const accounts = [...new Set(table.map((row) => row.account))];

  const tables = Object.fromEntries(
    accounts.map((account) => [
      account,
      table.filter((row) => row.account === account),
    ])
  );

  return tables;
};

// NOTE: table must have at least 1 row
// export const getTableTimeRange = (rows: TableType): [Date, Date] => {
//   const earliest = rows[rows.length - 1];
//   const mostRecent = rows[0];

//   return [new Date(earliest.when), new Date(mostRecent.when)];
// };
