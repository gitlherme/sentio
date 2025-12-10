"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateHabit } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import { Frequency } from "@/store/useStore"; // Keeping for type if needed, or remove
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface HabitFormProps {
  onSuccess?: () => void;
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function HabitForm({ onSuccess }: HabitFormProps) {
  const createHabitMutation = useCreateHabit();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [goal, setGoal] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [hasEndDate, setHasEndDate] = useState(false);

  const toggleDay = (dayIndex: number) => {
    setCustomDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const frequencyData =
      frequency === "daily" ? ["DAILY"] : customDays.map(String);

    createHabitMutation.mutate(
      {
        title,
        description,
        frequency: frequencyData,
        period: "ANYTIME", // Default for now, could act add to form
        goal,
        startDate: startDate.toISOString(),
        endDate: hasEndDate && endDate ? endDate.toISOString() : undefined,
      },
      {
        onSuccess: () => {
          // Reset form
          setTitle("");
          setDescription("");
          setFrequency("daily");
          setCustomDays([]);
          setGoal(1);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      <div className="grid gap-2">
        <Label htmlFor="habit-title">Title</Label>
        <Input
          id="habit-title"
          placeholder="Drink Water, Read Book..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="habit-desc">Description</Label>
        <Input
          id="habit-desc"
          placeholder="Motivation or details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        <Label>Frequency</Label>
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setFrequency("daily")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              frequency === "daily"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Every Day
          </button>
          <button
            type="button"
            onClick={() => {
              setFrequency("custom");
              if (customDays.length === 0) {
                // Default to Mon, Wed, Fri if clicking specific for first time
                setCustomDays([1, 3, 5]);
              }
            }}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              frequency === "custom"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Specific Days
          </button>
        </div>

        {frequency === "custom" && (
          <div className="flex justify-between gap-1 mt-2">
            {DAYS.map((day) => {
              const isSelected = customDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={cn(
                    "h-9 w-9 rounded-full text-xs font-medium transition-all ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {day.label.charAt(0)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="grid gap-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date: Date | undefined) =>
                  date && setStartDate(date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>End Date</Label>
            <div className="flex items-center h-full">
              <input
                type="checkbox"
                id="has-end-date"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
                className="mr-2"
              />
              <label
                htmlFor="has-end-date"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Set?
              </label>
            </div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={!hasEndDate}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>No end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                disabled={(date: Date) => date < startDate}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="goal">Daily Goal (Times)</Label>
        <Input
          id="goal"
          type="number"
          min={1}
          value={goal}
          onChange={(e) => setGoal(parseInt(e.target.value))}
        />
      </div>

      <DialogFooter>
        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={createHabitMutation.isPending}
        >
          {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
        </Button>
      </DialogFooter>
    </form>
  );
}
