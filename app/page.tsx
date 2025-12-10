"use client";

import AppLayout from "@/components/layout/app-layout";
import { MoodModal } from "@/components/tasks/mood-modal";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useHabits,
  useLogMood,
  useTasks,
  useToggleHabit,
  useUpdateTask,
} from "@/hooks/use-queries";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, Play, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Matches Mood type expected by MoodModal
type Mood = "happy" | "neutral" | "sad" | "excited" | "tired" | "active" | null;

export default function Home() {
  const { data: tasks = [] } = useTasks();
  const { data: habits = [] } = useHabits();

  const updateTask = useUpdateTask();
  const toggleHabitMutation = useToggleHabit();
  const logMood = useLogMood();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Mood Tracking State
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [moodSubject, setMoodSubject] = useState<{
    type: "task" | "habit";
    id: string;
    title: string;
    date?: string;
  } | null>(null);

  const today = new Date();
  // Get local date string YYYY-MM-DD for comparison
  const todayStr = today.toLocaleDateString("en-CA");

  const todaysTasks = tasks.filter((t) => {
    // Check if task is scheduled for today (date) or due today (dueDate)
    // We strictly compare the date part assuming UTC midnight storage for 'Date' fields
    const targetDate = t.date || t.dueDate;
    if (!targetDate) return false;
    const targetDateStr = new Date(targetDate).toISOString().split("T")[0];
    return targetDateStr === todayStr;
  });

  const todaysHabits = habits.filter((h) => {
    // Check frequency (Stored as string[], e.g., ["DAILY"] or ["MON", "WED"])
    const freq = h.frequency.map((f) => f.toUpperCase());
    if (freq.includes("DAILY")) return true;

    // Check specific day of week (e.g. "MON")
    const dayName = format(today, "EEE").toUpperCase();
    return freq.includes(dayName);
  });

  const handleTaskToggle = (task: Task) => {
    if (!task.completed) {
      // If we are completing the task, show the mood modal
      setMoodSubject({ type: "task", id: task.id, title: task.title });
      setMoodModalOpen(true);
    } else {
      // If unchecking, just toggle immediately
      updateTask.mutate({ id: task.id, completed: false });
    }
  };

  const handleHabitToggle = (habitId: string, isCompleted: boolean) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    if (!isCompleted) {
      // Completing -> Show mood modal
      setMoodSubject({
        type: "habit",
        id: habitId,
        title: habit.title,
        date: new Date().toISOString(),
      });
      setMoodModalOpen(true);
    } else {
      // Uncompleting -> Direct mutation
      toggleHabitMutation.mutate({
        id: habitId,
        date: new Date().toISOString(),
        completed: false,
      });
    }
  };

  const handleMoodSelect = (moodVal: Mood) => {
    if (moodSubject) {
      // 1. Log Mood
      // Map string mood to numeric value expected by API (1-5)
      const moodMap: Record<string, number> = {
        sad: 1,
        neutral: 3,
        happy: 4,
        excited: 5,
        active: 5,
        tired: 2,
      };
      const moodNum = moodMap[moodVal || "neutral"] || 3;

      const actionType = moodSubject.type === "task" ? "task" : "habit";
      logMood.mutate({
        mood: moodNum,
        note: `Completed ${actionType}: ${moodSubject.title}`,
        date: new Date().toISOString(),
      });

      // 2. Perform Action
      if (moodSubject.type === "task") {
        updateTask.mutate({ id: moodSubject.id, completed: true });
      } else {
        if (moodSubject.date) {
          toggleHabitMutation.mutate({
            id: moodSubject.id,
            date: moodSubject.date,
            completed: true,
          });
        }
      }

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

      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
              Good Morning, Alex
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-light">
              {format(today, "EEEE, MMMM do")} • Let&apos;s make today count.
            </p>
          </div>
          <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <TaskForm onSuccess={() => setIsTaskModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* LEFT COL: Today's Focus (Tasks) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="h-full border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="font-display text-2xl text-foreground">
                  Today&apos;s Focus
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  Your prioritized list for maximum impact.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaysTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">
                      All clear for today
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a task to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Group tasks logic inline */}
                    {(() => {
                      const grouped = todaysTasks.reduce((acc, task) => {
                        const pName = task.project?.name || "General";
                        if (!acc[pName]) acc[pName] = [];
                        acc[pName].push(task);
                        return acc;
                      }, {} as Record<string, Task[]>);

                      const sortedProjects = Object.keys(grouped).sort(
                        (a, b) => {
                          if (a === "General") return -1;
                          if (b === "General") return 1;
                          return a.localeCompare(b);
                        }
                      );

                      return sortedProjects.map((projectName) => (
                        <div key={projectName} className="space-y-2">
                          <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                            <span className="uppercase tracking-wider">
                              {projectName}
                            </span>
                            <div className="h-px bg-border flex-1 opacity-50" />
                          </h4>
                          <div className="space-y-2">
                            {grouped[projectName].map((task) => (
                              <div
                                key={task.id}
                                className={cn(
                                  "group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:shadow-md",
                                  task.completed
                                    ? "bg-muted/50 opacity-75 border-transparent"
                                    : "bg-card border-border hover:border-primary/20"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleTaskToggle(task)}
                                    className={cn(
                                      "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                      task.completed
                                        ? "bg-primary border-primary text-primary-foreground scale-105"
                                        : "border-muted-foreground/30 hover:border-primary"
                                    )}
                                  >
                                    {task.completed && (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <span
                                    className={cn(
                                      "text-lg transition-all duration-300 font-medium",
                                      task.completed
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                    )}
                                  >
                                    {task.title}
                                  </span>
                                </div>
                                {/* We can hide category tag here since we have headers now, or keep it? Keeping it redundant/cleaner to remove? Let's remove for cleaner look under header */}
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COL: Habits & Focus */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            {/* Habit Tracker Row */}
            <Card className="border shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl text-foreground">
                  Daily Rituals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {todaysHabits.map((habit) => {
                    // Check if completed today based on logs
                    const isCompleted = habit.logs.some((l) => {
                      const logDateStr = new Date(l.date)
                        .toISOString()
                        .split("T")[0];
                      return logDateStr === todayStr && l.completed;
                    });

                    return (
                      <button
                        key={habit.id}
                        onClick={() => handleHabitToggle(habit.id, isCompleted)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-300",
                          isCompleted
                            ? "bg-accent/10 border-accent/20 text-accent-foreground dark:text-accent"
                            : "bg-card border-border hover:border-accent/40 hover:shadow-sm"
                        )}
                        title={habit.title}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                            isCompleted
                              ? "bg-accent border-accent"
                              : "border-muted-foreground/30"
                          )}
                        >
                          {isCompleted && (
                            <Check className="h-2.5 w-2.5 text-accent-foreground" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-semibold truncate max-w-[100px]",
                            isCompleted
                              ? "text-accent-foreground dark:text-accent"
                              : "text-foreground"
                          )}
                        >
                          {habit.title}
                        </span>
                      </button>
                    );
                  })}
                  {todaysHabits.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      No habits for today.
                    </p>
                  )}
                  <Link
                    href="/habits"
                    className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors ml-auto"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Focus Card Widget */}
            <Card className="flex-1 flex flex-col justify-between border shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="font-display text-xl text-foreground">
                  Focus Session
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ready to enter flow state?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pb-8 flex-1">
                <div className="relative mb-6 group cursor-pointer">
                  {/* Decorative rings - darker for contrast */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary/10 blur-sm transform scale-110" />
                  <div className="h-32 w-32 rounded-full border-[6px] border-primary/20 flex items-center justify-center bg-card shadow-inner">
                    <span className="text-3xl font-bold font-display text-primary tabular-nums">
                      25:00
                    </span>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg transform translate-x-2 translate-y-2 group-hover:scale-110 transition-transform">
                    <Play className="h-4 w-4 fill-current" />
                  </div>
                </div>
                <Link href="/focus">
                  <Button
                    variant="outline"
                    className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-medium"
                  >
                    Open Focus Mode
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Insight Mini-Card */}
            <Card className="border shadow-sm bg-gradient-to-br from-secondary/50 to-card">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="p-2 bg-card rounded-full shadow-sm ring-1 ring-border">
                  <Zap className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    AI Insight
                  </p>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    &quot;You seem more productive in the mornings when you
                    start with a creative task.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
