import { useLocation } from "react-router";
import { decodeTableString, tableToAccountTables } from "../util/table";
import { useEffect, useMemo, useState } from "react";
import {
  getAggregateUsageStats,
  getForecastStats,
  getPlaceStats,
  getTrendStats,
} from "../util/stats";
import { canGetPlanFromAccount, getPlanFromAccount } from "../util/plans";
import { addDays, daysBetween, formatDate, roundToHundredth } from "../util";
import { PlacesBarChart, UsageOverTimeLineChart } from "./Charts";

// TODO: transition animations between accounts

const Report = () => {
  const { hash } = useLocation();

  const [selectedAccount, setSelectedAccount] = useState<string>("");

  // cut off the '#' at the beginning
  const table = useMemo(
    () => (!hash ? null : decodeTableString(hash.substring(1))),
    [hash]
  );

  const mostRecentDateForSelectedAccount = useMemo(
    () =>
      table?.success && selectedAccount
        ? new Date(
            table.data.reduce(
              (prev, curr) =>
                curr.account === selectedAccount && curr.when > prev
                  ? curr.when
                  : prev,
              0
            )
          )
        : undefined,
    [table, selectedAccount]
  );

  const plan = useMemo(() => {
    try {
      return selectedAccount &&
        table?.success &&
        mostRecentDateForSelectedAccount
        ? getPlanFromAccount(selectedAccount, mostRecentDateForSelectedAccount)
        : undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, [selectedAccount, table, mostRecentDateForSelectedAccount]);

  const accountTables = useMemo(
    () =>
      !table || !table.success || table.data.length === 0
        ? {}
        : tableToAccountTables(table.data),
    [table]
  );

  const placeStats = useMemo(
    () =>
      selectedAccount in accountTables
        ? getPlaceStats(accountTables[selectedAccount])
        : undefined,
    [accountTables, selectedAccount]
  );

  const aggregateUsageStats = useMemo(
    () =>
      selectedAccount in accountTables
        ? getAggregateUsageStats(accountTables[selectedAccount])
        : undefined,
    [accountTables, selectedAccount]
  );

  const trendStats = useMemo(
    () =>
      selectedAccount in accountTables && plan && aggregateUsageStats
        ? getTrendStats(
            accountTables[selectedAccount],
            plan,
            plan.totalAmount + aggregateUsageStats.importedAmount,
            aggregateUsageStats.nonImportedAmount
          )
        : undefined,

    [accountTables, selectedAccount, plan, aggregateUsageStats]
  );

  const balance = useMemo(
    () =>
      plan && aggregateUsageStats
        ? plan.totalAmount +
          aggregateUsageStats.importedAmount -
          aggregateUsageStats.nonImportedAmount
        : undefined,
    [plan, aggregateUsageStats]
  );

  const forecastStats = useMemo(
    () =>
      plan && aggregateUsageStats && selectedAccount in accountTables
        ? getForecastStats(
            accountTables[selectedAccount],
            plan,
            plan.totalAmount + aggregateUsageStats.importedAmount,
            aggregateUsageStats.nonImportedAmount
          )
        : undefined,
    [plan, aggregateUsageStats, selectedAccount, accountTables]
  );
  console.log(forecastStats);

  useEffect(() => {
    const firstKey = Object.keys(accountTables)[0];
    if (firstKey) {
      setSelectedAccount(firstKey);
    }
  }, [accountTables]);

  if (!plan) {
    return (
      <div>
        <div className="p-4 flex flex-col gap-2 items-center">
          <div className="flex flex-col items-center gap-2 p-3 border-[1px] border-black/30 rounded-xl w-[90%] max-w-[1000px]">
            <div>Unsupported plan</div>
          </div>
        </div>
      </div>
    );
  }

  if (!hash) {
    return (
      <div>
        <div className="p-4 flex flex-col gap-2 items-center">
          <div className="flex flex-col items-center gap-2 p-3 border-[1px] border-black/30 rounded-xl w-[90%] max-w-[1000px]">
            <div>No data provided</div>
          </div>
        </div>
      </div>
    );
  }

  if (!table || !table.success) {
    return (
      <div>
        <div className="p-4 flex flex-col gap-2 items-center">
          <div className="flex flex-col items-center gap-2 p-3 border-[1px] border-black/30 rounded-xl w-[90%] max-w-[1000px]">
            <div>Error processing table: {table?.error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (table.data.length === 0) {
    return (
      <div>
        <div className="p-4 flex flex-col gap-2 items-center">
          <div className="flex flex-col items-center gap-2 p-3 border-[1px] border-black/30 rounded-xl w-[90%] max-w-[1000px]">
            <div>Found 0 rows in provided table</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 flex flex-col gap-2 items-center">
        <div className="flex flex-col items-center gap-2 p-3 border-[1px] border-black/30 rounded-xl w-[90%] max-w-[1000px]">
          <select
            className="border-[1px] rounded-md border-black/20 p-0.5"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {mostRecentDateForSelectedAccount
              ? Object.keys(accountTables)
                  .filter((account) =>
                    canGetPlanFromAccount(
                      account,
                      mostRecentDateForSelectedAccount
                    )
                  )
                  .map((account, idx) => <option key={idx}>{account}</option>)
              : undefined}
          </select>
          <div className="grid grid-cols-[1fr_2fr] gap-2 w-full">
            <div className="border-[1px] border-black/20 rounded-lg p-3">
              <h3 className="text-black/70 text-sm">plan</h3>
              <div className="flex flex-col gap-1">
                <div className="text-2xl">{selectedAccount}</div>
                <div className="text-sm">
                  {plan ? formatDate(plan.planStart) : undefined} -{" "}
                  {plan ? formatDate(plan.planEnd) : undefined} (
                  {plan ? daysBetween(plan.planStart, plan.planEnd) : undefined}{" "}
                  days)
                </div>
              </div>
              <div className="h-8" />
              <div className="text-md flex flex-col gap-1">
                <div className="flex justify-between">
                  <p>Original Plan Amount</p>
                  <p>{plan?.totalAmount}</p>
                </div>
                <div className="flex justify-between">
                  <p>Imported</p>
                  <p>{aggregateUsageStats?.importedAmount}</p>
                </div>
                <div className="flex justify-between">
                  <p>Used</p>
                  <p>
                    {aggregateUsageStats
                      ? -1 * aggregateUsageStats.nonImportedAmount
                      : undefined}
                  </p>
                </div>
                <hr />
                <div className="flex justify-between">
                  <p>Balance</p>
                  <p>{balance}</p>
                </div>
              </div>
            </div>
            <div className="border-[1px] border-black/20 rounded-lg p-3 flex flex-col gap-2">
              <h3 className="text-black/70 text-sm">trend</h3>
              <div className="flex justify-between gap-2 flex-1">
                <div className="flex flex-col justify-between gap-2 flex-1">
                  <div className="h-[250px] w-full">
                    <UsageOverTimeLineChart
                      data={trendStats?.usageOverTime ?? []}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-around items-center p-5">
                  <div className="text-center">
                    <p className="font-medium text-lg">
                      {trendStats
                        ? roundToHundredth(trendStats.currentRate)
                        : undefined}{" "}
                      / day
                    </p>
                    <p className="text-sm">actual rate</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-lg">
                      {trendStats
                        ? roundToHundredth(trendStats.idealRate)
                        : undefined}{" "}
                      / day
                    </p>
                    <p className="text-sm">ideal rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-[2fr_1fr] gap-3 w-full">
            <div className="border-[1px] border-black/20 rounded-lg p-3">
              <h3 className="text-black/70 text-sm">places</h3>
              <div className="flex justify-between">
                <div className="">
                  <span className="text-xl">
                    {placeStats?.top.name ? placeStats.top.name : "N/A"}
                  </span>{" "}
                  <span className="text-sm">top place</span>
                </div>
                <div className="">
                  <span className="text-sm">used</span>{" "}
                  <span className="text-xl">{placeStats?.top.used}</span>
                </div>
              </div>
              <div className="h-[300px] w-full mt-3">
                <PlacesBarChart
                  data={Object.entries(placeStats?.byPlace ?? {})
                    .map((entry) => ({
                      place: entry[0],
                      used: entry[1],
                    }))
                    .sort((a, b) => b.used - a.used)}
                />
              </div>
            </div>
            <div className="border-[1px] border-black/20 rounded-lg p-3">
              <h3 className="text-black/70 text-sm">forecast</h3>
              {forecastStats ===
              undefined ? null : forecastStats.remainingDaysAtCurrentRate <=
                0 ? (
                <div className="flex items-center justify-center text-center h-[85%] opacity-50">
                  no balance remaining
                </div>
              ) : (
                <div className="flex flex-col gap-5 justify-center h-[75%]">
                  <p>
                    used{" "}
                    <span className="font-medium">
                      {forecastStats
                        ? roundToHundredth(forecastStats.currentRate)
                        : undefined}{" "}
                      / day
                    </span>{" "}
                    over the past{" "}
                    <span className="font-medium">
                      {forecastStats?.daysSinceBegin} days
                    </span>
                  </p>
                  <p>
                    at this rate, plan will run out in{" "}
                    <span className="font-medium">
                      {forecastStats?.remainingDaysAtCurrentRate} days
                    </span>
                    , on{" "}
                    <span className="font-medium">
                      {forecastStats
                        ? formatDate(
                            addDays(
                              new Date(),
                              forecastStats.remainingDaysAtCurrentRate
                            )
                          )
                        : undefined}
                    </span>
                  </p>
                  <p>
                    use{" "}
                    <span className="font-medium">
                      {forecastStats?.requiredRate} / day
                    </span>{" "}
                    to instead run out on{" "}
                    <span className="font-medium">
                      {plan ? formatDate(plan.planEnd) : undefined}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
