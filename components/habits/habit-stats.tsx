"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getHabitStats } from "@/lib/habit-utils";
import { Habit } from "@/lib/types";
import { Activity, CalendarDays, Flame, Trophy } from "lucide-react";

interface HabitStatsProps {
  habit: Habit;
}

export function HabitStats({ habit }: HabitStatsProps) {
  const { completedDates, streak } = getHabitStats(habit);

  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

  const monthlyCheckIns = Array.from(completedDates).filter((d) =>
    d.startsWith(currentMonth)
  ).length;

  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();

  const monthlyRate = Math.round((monthlyCheckIns / daysInMonth) * 100);
  const totalCheckIns = completedDates.size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Monthly Check-ins */}
      <Card className="bg-muted/30 border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="p-1 rounded-full bg-green-500/10 text-green-500">
              <CalendarDays className="h-3 w-3" />
            </span>
            Monthly check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyCheckIns}</div>
          <p className="text-xs text-muted-foreground">Days</p>
        </CardContent>
      </Card>

      {/* Total Check-ins */}
      <Card className="bg-muted/30 border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="p-1 rounded-full bg-blue-500/10 text-blue-500">
              <Trophy className="h-3 w-3" />
            </span>
            Total check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCheckIns}</div>
          <p className="text-xs text-muted-foreground">Days</p>
        </CardContent>
      </Card>

      {/* Monthly Rate */}
      <Card className="bg-muted/30 border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="p-1 rounded-full bg-orange-500/10 text-orange-500">
              <Activity className="h-3 w-3" />
            </span>
            Monthly check-in rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{monthlyRate}%</div>
          <p className="text-xs text-muted-foreground">%</p>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-muted/30 border-none shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="p-1 rounded-full bg-red-500/10 text-red-500">
              <Flame className="h-3 w-3" />
            </span>
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streak}</div>
          <p className="text-xs text-muted-foreground">Days</p>
        </CardContent>
      </Card>
    </div>
  );
}
