import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatDateShort, roundToHundredth } from "../util";

export const PlacesBarChart = ({
  data,
}: {
  data: {
    place: string;
    used: number;
  }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{ left: -25 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis
          dataKey="place"
          type="category"
          width={210}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Bar
          dataKey="used"
          stackId="a"
          fill="#ff6467" // tailwind red-400
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const UsageOverTimeTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;

  const labelAsDate = label as Date;

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: 10,
      }}
    >
      <p className="font-medium">{formatDate(labelAsDate)}</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {payload
          .map((entry) => ({
            ...entry,
            name:
              entry.name === "idealRemaining"
                ? "ideal remaining"
                : entry.name === "actualRemaining"
                ? "actual remaining"
                : entry.name,
          }))
          .map((entry, index) => (
            <li key={index} style={{ color: entry.color }}>
              {entry.name}: {roundToHundredth(entry.value as number)}
            </li>
          ))}
      </ul>
    </div>
  );
};

export const UsageOverTimeLineChart = ({
  data,
}: {
  data: {
    day: Date;
    idealRemaining: number;
    actualRemaining?: number;
  }[];
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: -15,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickFormatter={(val) => formatDateShort(new Date(val))}
          tickMargin={25}
          angle={75}
          fontSize={10}
        />
        <YAxis
          domain={[0, "dataMax"]}
          tickFormatter={(val) => Math.round(val).toString()}
          // TODO: figure out how to get a rotated label for the y axis
        />
        <Tooltip content={<UsageOverTimeTooltip />} />
        <Line
          dataKey="idealRemaining"
          stroke="#000000"
          dot={{ r: 0 }}
          strokeWidth={2}
        />
        <Line
          dataKey="actualRemaining"
          stroke="#ff6467" // tailwind red-400
          dot={{ r: 0 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
