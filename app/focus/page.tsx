"use client";

import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogFocusSession, useTasks } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function FocusPage() {
  const { data: tasks = [] } = useTasks();
  const logSessionMutation = useLogFocusSession();

  const [isActive, setIsActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25); // Minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  const handleSessionComplete = useCallback(() => {
    // Log the session
    // We log the configured duration, or actual time spent if we tracked it differently.
    // For now assuming full completion of set time.
    logSessionMutation.mutate({
      duration: focusDuration,
      taskId: selectedTaskId || undefined,
    });

    // Play sound or notify
    new Audio("/sounds/complete.mp3").play().catch(() => {}); // optional
  }, [focusDuration, selectedTaskId, logSessionMutation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            if (mode === "focus") {
              handleSessionComplete();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, handleSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? focusDuration * 60 : 5 * 60);
  };

  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? focusDuration * 60 : 5 * 60);
    setIsActive(false);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      setFocusDuration(val);
      if (!isActive && mode === "focus") {
        setTimeLeft(val * 60);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const totalTime = mode === "focus" ? focusDuration * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <AppLayout>
      <div className="h-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="z-10 text-center space-y-8 max-w-md w-full px-4">
          <div className="space-y-4">
            <h1 className="text-4xl font-display font-bold tracking-tight">
              {mode === "focus" ? "Deep Focus" : "Time to Recharge"}
            </h1>

            {/* Task Selection */}
            {mode === "focus" && (
              <div className="max-w-xs mx-auto">
                <select
                  className="w-full bg-background/50 border rounded-md p-2 text-sm"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  disabled={isActive}
                >
                  <option value="">Select a task to focus on...</option>
                  {tasks
                    .filter((t) => !t.completed)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center py-4">
            {/* Circular Progress (SVG) */}
            <div className="relative h-72 w-72 sm:h-80 sm:w-80">
              <svg className="h-full w-full rotate-[-90deg]">
                {/* Track */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="140"
                  className="stroke-muted/20 fill-none"
                  strokeWidth="8"
                />
                {/* Progress */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="140"
                  className={cn(
                    "fill-none transition-all duration-1000 ease-linear",
                    mode === "focus" ? "stroke-primary" : "stroke-emerald-500"
                  )}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 140}
                  strokeDashoffset={2 * Math.PI * 140 * (1 - progress / 100)}
                />
              </svg>

              {/* Central Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-bold font-display tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground mt-2">
                  {isActive ? "Running" : "Paused"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6 items-center">
            {/* Time Input (Only when paused and logic allows) */}
            {!isActive && mode === "focus" && (
              <div className="flex items-center gap-2">
                <Label htmlFor="duration" className="text-xs">
                  Duration (min)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="180"
                  value={focusDuration}
                  onChange={handleDurationChange}
                  className="w-16 h-8 text-center"
                />
              </div>
            )}

            <div className="flex items-center justify-center gap-6">
              <Button
                size="icon"
                variant="outline"
                className="h-14 w-14 rounded-full border-2"
                onClick={resetTimer}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                size="lg"
                className="h-20 w-20 rounded-full text-white shadow-xl hover:scale-105 transition-transform"
                onClick={toggleTimer}
              >
                {isActive ? (
                  <Pause className="h-8 w-8 fill-current" />
                ) : (
                  <Play className="h-8 w-8 fill-current ml-1" />
                )}
              </Button>

              <Button
                size="icon"
                variant="outline"
                className={cn(
                  "h-14 w-14 rounded-full border-2 transition-colors",
                  mode === "focus"
                    ? "opacity-50 hover:opacity-100"
                    : "bg-emerald-100 border-emerald-200 text-emerald-600"
                )}
                onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
              >
                <Zap className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
