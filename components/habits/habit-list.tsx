"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Habit } from "@/lib/types";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { useState } from "react";
import { HabitItem } from "./habit-item";

interface HabitListProps {
  habits: Habit[];
  selectedHabitId: string | null;
  onSelectHabit: (id: string | null) => void;
  onAddHabit: () => void;
  onToggleHabit: (id: string, date: string) => void;
}

export function HabitList({
  habits,
  selectedHabitId,
  onSelectHabit,
  onAddHabit,
  onToggleHabit,
}: HabitListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHabits = habits.filter((habit) =>
    habit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display tracking-tight">
              Habit
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              onClick={onAddHabit}
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
            <p>No habits found</p>
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              isSelected={selectedHabitId === habit.id}
              onClick={() => onSelectHabit(habit.id)}
              onToggle={(date) => onToggleHabit(habit.id, date)}
            />
          ))
        )}
      </div>
    </div>
  );
}
