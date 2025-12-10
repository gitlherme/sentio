"use client";

import { Button } from "@/components/ui/button";
import { Habit } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import { HabitCalendar } from "./habit-calendar";
import { HabitChart } from "./habit-chart";
import { HabitStats } from "./habit-stats";

interface HabitDetailsProps {
  habit: Habit;
}

export function HabitDetails({ habit }: HabitDetailsProps) {
  return (
    <div className="p-8 h-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
            {/* Placeholder Icon */}
            {habit.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              {habit.title}
            </h1>
            {habit.description && (
              <p className="text-muted-foreground">{habit.description}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <HabitStats habit={habit} />

      {/* Split View: Calendar & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">December</h3>
          <HabitCalendar habit={habit} />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">
            Daily Goals (Completion)
          </h3>
          <div className="p-6 bg-muted/20 rounded-2xl h-[400px]">
            <HabitChart habit={habit} />
          </div>
        </div>
      </div>
    </div>
  );
}
