"use client";

import { getHabitStats } from "@/lib/habit-utils";
import { Habit } from "@/lib/types";
import { format, subDays } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface HabitChartProps {
  habit: Habit;
}

export function HabitChart({ habit }: HabitChartProps) {
  const { completedDates } = getHabitStats(habit);

  // Generate data for the last 14 days or so
  const data = Array.from({ length: 14 }).map((_, i) => {
    const date = subDays(new Date(), 13 - i); // 13 days ago to today
    const dateStr = format(date, "yyyy-MM-dd");

    // This is where we'd put real value if it was a numeric goal.
    // For boolean habits, it's 1 or 0 (or * goal).
    const isCompleted = completedDates.has(dateStr);
    const value = isCompleted ? 1 : 0;

    return {
      date: format(date, "MMM d"),
      value: value,
    };
  });

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--muted-foreground) / 0.1)"
          />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground) / 0.5)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground) / 0.5)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            cursor={{ stroke: "hsl(var(--primary) / 0.5)" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
