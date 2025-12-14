import { NCSUParser } from "./ncsu";
import { DukeParser } from "./duke";
import exampleNCSUTable from "../../assets/example-ncsu.txt?raw";
import exampleDukeTable from "../../assets/example-duke.txt?raw";
import { ReactNode } from "react";
import { SchoolParser } from "./parser";

export type SchoolId = "ncsu" | "duke";

export interface SchoolConfig {
  id: SchoolId;
  displayName: string;
  parser: SchoolParser;
  exampleTable: string;
  instructions: ReactNode;
  colors: {
    bg: string;
  };
}

export const SCHOOLS: Record<SchoolId, SchoolConfig> = {
  ncsu: {
    id: "ncsu",
    displayName: "NCSU",
    parser: new NCSUParser(),
    exampleTable: exampleNCSUTable,
    instructions: (
      <p className="text-xs">
        Navigate to{" "}
        <a
          target="_blank"
          href="https://get.cbord.com/ncsu/full/funds_home.php"
          className="underline"
        >
          CBORD GET
        </a>{" "}
        and log in {">"} Click "View All Transaction History" (under the "My
        Recent Transactions" header) {">"} Select the entire transaction history
        table and copy it
      </p>
    ),
    colors: {
      bg: "bg-ncsu",
    },
  },
  duke: {
    id: "duke",
    displayName: "Duke",
    parser: new DukeParser(),
    exampleTable: exampleDukeTable,
    instructions: <p>TODO</p>,
    colors: {
      bg: "bg-duke",
    },
  },
};

export const getSchoolConfig = (id: string): SchoolConfig | undefined => {
  return SCHOOLS[id as SchoolId];
};

export const getAllSchools = (): SchoolConfig[] => {
  return Object.values(SCHOOLS);
};
