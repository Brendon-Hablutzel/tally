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
