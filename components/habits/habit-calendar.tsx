"use client";

import { Button } from "@/components/ui/button";
import { getHabitStats } from "@/lib/habit-utils";
import { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

interface HabitCalendarProps {
  habit: Habit;
}

export function HabitCalendar({ habit }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { completedDates } = getHabitStats(habit);

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start, end });

    // Pad the start
    const startDay = getDay(start); // 0 = Sunday
    const paddingDays = Array(startDay).fill(null);

    return [...paddingDays, ...daysInMonth];
  }, [currentDate]);

  const toggleMonth = (dir: 1 | -1) => {
    setCurrentDate((prev) =>
      dir === 1 ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  return (
    <div className="p-6 bg-muted/20 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleMonth(-1)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {format(currentDate, "MMMM")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleMonth(1)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-[10px] text-muted-foreground/60 uppercase font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-2">
        {days.map((day, idx) => {
          if (!day) return <div key={`pad-${idx}`} />;

          const dateStr = format(day, "yyyy-MM-dd");
          const isCompleted = completedDates.has(dateStr);
          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={dateStr}
              className={cn(
                "aspect-square rounded-full flex items-center justify-center text-xs font-medium cursor-default transition-all",
                isCompleted
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted/40 text-muted-foreground/40",
                isToday &&
                  !isCompleted &&
                  "border border-primary text-primary bg-background"
              )}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </div>
  );
}
