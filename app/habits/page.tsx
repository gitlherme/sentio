"use client";

import { HabitDetails } from "@/components/habits/habit-details";
import { HabitForm } from "@/components/habits/habit-form";
import { HabitLayout } from "@/components/habits/habit-layout";
import { HabitList } from "@/components/habits/habit-list";
import AppLayout from "@/components/layout/app-layout";
import { MoodModal } from "@/components/tasks/mood-modal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHabits, useLogMood, useToggleHabit } from "@/hooks/use-queries";
import { Mood } from "@/store/useStore";
import { Zap } from "lucide-react";
import { useState } from "react";

export default function HabitsPage() {
  const { data: habits = [] } = useHabits();
  const toggleHabitMutation = useToggleHabit();
  const logMood = useLogMood();

  const [explicitlySelectedHabitId, setExplicitlySelectedHabitId] = useState<
    string | null
  >(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);

  // Mood Tracking
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [moodSubject, setMoodSubject] = useState<{
    id: string;
    title: string;
    date: string;
  } | null>(null);

  const activeHabitId = explicitlySelectedHabitId ?? habits[0]?.id ?? null;
  const selectedHabit = habits.find((h) => h.id === activeHabitId);

  const handleToggleHabit = (id: string, dateStr: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const date = new Date(dateStr);
    const isCompleted = habit.logs?.some(
      (l) =>
        new Date(l.date).toDateString() === date.toDateString() && l.completed
    );

    if (!isCompleted) {
      // Completing -> Prompt for Mood
      // Only prompt if logging for "today" to avoid confusion?
      // User request didn't specify, but let's allow it for any date since they might be backfilling.
      setMoodSubject({
        id,
        title: habit.title,
        date: date.toISOString(),
      });
      setMoodModalOpen(true);
    } else {
      // Uncompleting
      toggleHabitMutation.mutate({
        id,
        date: date.toISOString(),
        completed: false,
      });
    }
  };

  const handleMoodSelect = (moodVal: Mood) => {
    if (moodSubject) {
      // 1. Log Mood
      const moodMap: Record<string, number> = {
        sad: 1,
        neutral: 3,
        happy: 4,
        excited: 5,
        active: 5,
        tired: 2,
      };
      const moodNum = moodMap[moodVal || "neutral"] || 3;

      logMood.mutate({
        mood: moodNum,
        note: `Completed habit: ${moodSubject.title}`,
      });

      // 2. Complete Habit
      toggleHabitMutation.mutate({
        id: moodSubject.id,
        date: moodSubject.date,
        completed: true,
      });

      setMoodModalOpen(false);
      setMoodSubject(null);
    }
  };

  return (
    <AppLayout>
      <MoodModal
        isOpen={moodModalOpen}
        onClose={() => setMoodModalOpen(false)}
        onSelectMood={handleMoodSelect}
        taskTitle={moodSubject?.title || ""}
      />

      <HabitLayout
        sidebar={
          <HabitList
            habits={habits}
            selectedHabitId={activeHabitId}
            onSelectHabit={setExplicitlySelectedHabitId}
            onAddHabit={() => setIsHabitModalOpen(true)}
            onToggleHabit={handleToggleHabit}
          />
        }
        details={
          selectedHabit ? (
            <HabitDetails habit={selectedHabit} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Zap className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-lg font-medium">No habit selected</p>
              <p className="text-sm">Select a habit to view details</p>
              {habits.length === 0 && (
                <Button
                  onClick={() => setIsHabitModalOpen(true)}
                  variant="link"
                  className="mt-2"
                >
                  Create your first habit
                </Button>
              )}
            </div>
          )
        }
      />

      <Dialog open={isHabitModalOpen} onOpenChange={setIsHabitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <HabitForm onSuccess={() => setIsHabitModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
