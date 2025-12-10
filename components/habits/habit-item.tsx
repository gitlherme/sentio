"use client";

import { getHabitStats } from "@/lib/habit-utils";
import { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

interface HabitItemProps {
  habit: Habit;
  isSelected: boolean;
  onClick: () => void;
  onToggle: (date: string) => void;
}

export function HabitItem({
  habit,
  isSelected,
  onClick,
  onToggle,
}: HabitItemProps) {
  const today = new Date().toISOString().split("T")[0];
  const { completedDates, streak } = getHabitStats(habit);

  const isCompletedToday = completedDates.has(today);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(today);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200",
        isSelected ? "bg-secondary/50 shadow-sm" : "hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-colors",
            isSelected
              ? "bg-background text-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {/* Placeholder for icon if we had one, using first letter for now */}
          {habit.title.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3
            className={cn(
              "font-medium truncate",
              isSelected
                ? "text-foreground"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {habit.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {streak > 0 && (
              <span className="flex items-center gap-1">🔥 {streak} Days</span>
            )}
            <span>• {isCompletedToday ? "Done" : "Pending"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Simple checkbox-like indicator */}
        <div
          onClick={handleToggle}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer",
            isCompletedToday
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
          )}
        >
          {isCompletedToday ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}
