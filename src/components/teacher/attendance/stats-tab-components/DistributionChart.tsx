"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DistributionData {
  name: string;
  value: number;
  color: string;
}

interface DistributionChartProps {
  data: DistributionData[];
}

export default function DistributionChart({ data }: DistributionChartProps) {
  const hasData = data.some((item) => item.value > 0);

  // Transform data to be compatible with recharts
  const chartData = data.map(({ name, value, color }) => ({
    name,
    value,
    fill: color,
  }));

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No attendance data available for distribution
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: { name?: string; percent?: number }) =>
                props.name && props.percent !== undefined
                  ? `${props.name}: ${(props.percent * 100).toFixed(0)}%`
                  : ""
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
