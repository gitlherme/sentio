"use client";

import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMoods } from "@/hooks/use-queries";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import {
  Activity,
  ArrowUpRight,
  Battery,
  Frown,
  Meh,
  Smile,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mood Configuration
const MOODS = {
  1: {
    label: "Drained",
    icon: Frown,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  2: {
    label: "Tired",
    icon: Battery,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  3: {
    label: "Neutral",
    icon: Meh,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
  },
  4: {
    label: "Good",
    icon: Smile,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  5: {
    label: "Flow",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
};

export default function MoodPage() {
  const { data: moodLogs = [] } = useMoods();

  const today = useMemo(() => new Date(), []);

  // --- Process Data for Charts & Insights ---

  // 1. Weekly Trend (Last 7 Days Icons)
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(today, 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      // Find average mood for this day
      const daysLogs = moodLogs.filter((l) => {
        // l.date is UTC string from DB/JSON. parseISO keeps it as Date (local aware when formatted)
        // or we can just use new Date(l.date)
        return format(new Date(l.date), "yyyy-MM-dd") === dateStr;
      });
      if (daysLogs.length === 0) return { date: d, mood: null };

      const avg =
        daysLogs.reduce((acc, curr) => acc + curr.mood, 0) / daysLogs.length;
      return { date: d, mood: Math.round(avg) as 1 | 2 | 3 | 4 | 5 };
    });
  }, [moodLogs, today]);

  // 2. Daily Trend Chart Data (Last 14 Days)
  const chartData = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(today, 13 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const daysLogs = moodLogs.filter(
        (l) => format(new Date(l.date), "yyyy-MM-dd") === dateStr
      );
      const avg =
        daysLogs.length > 0
          ? daysLogs.reduce((acc, curr) => acc + curr.mood, 0) / daysLogs.length
          : 0;
      return {
        day: format(d, "dd"),
        mood: avg,
        fullDate: dateStr,
      };
    });
  }, [moodLogs, today]);

  // 3. Task Correlation Insights
  const insights = useMemo(() => {
    // Filter logs that are related to tasks (we know we prefixed them with "Completed task: ")
    const taskLogs = moodLogs.filter((l) =>
      l.note?.startsWith("Completed task:")
    );

    const happyTasks = taskLogs
      .filter((l) => l.mood >= 4)
      .map((l) => ({
        taskName: l.note?.replace("Completed task: ", "") || "",
        mood: l.mood,
        date: l.date,
      }));

    const drainedTasks = taskLogs
      .filter((l) => l.mood <= 2)
      .map((l) => ({
        taskName: l.note?.replace("Completed task: ", "") || "",
        mood: l.mood,
        date: l.date,
      }));

    return { happyTasks, drainedTasks };
  }, [moodLogs]);

  // 4. Today's Mood
  const todaysLatestMood = useMemo(() => {
    const todayStr = format(today, "yyyy-MM-dd");
    const todayLogs = moodLogs
      .filter((l) => format(new Date(l.date), "yyyy-MM-dd") === todayStr)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return todayLogs[0] ? todayLogs[0].mood : null;
  }, [moodLogs, today]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">
              Mood Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Understand yourself better, one day at a time.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className="bg-background shadow-sm hover:bg-background"
            >
              {format(today, "MMMM yyyy")}
            </Button>
          </div>
        </div>

        {/* Top Row: Today & Weekly Trend */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Today's Mood Card */}
          <Card className="md:col-span-4 border-none shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                Today&apos;s Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 py-4">
                {todaysLatestMood ? (
                  <div
                    className={cn(
                      "p-4 rounded-full shadow-inner",
                      MOODS[todaysLatestMood as keyof typeof MOODS]?.bg
                    )}
                  >
                    {(() => {
                      const Icon =
                        MOODS[todaysLatestMood as keyof typeof MOODS]?.icon ||
                        Meh;
                      return (
                        <Icon
                          className={cn(
                            "h-10 w-10",
                            MOODS[todaysLatestMood as keyof typeof MOODS]?.color
                          )}
                        />
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-4 rounded-full bg-muted shadow-inner">
                    <Meh className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold font-display">
                    {todaysLatestMood
                      ? MOODS[todaysLatestMood as keyof typeof MOODS]?.label
                      : "No data yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {todaysLatestMood
                      ? "Logged today"
                      : "Complete a task to log"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trend */}
          <Card className="md:col-span-8 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-medium">
                  Weekly Mood Trend
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Your mood is generally positive this week!</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center py-4 px-2">
                {last7Days.map((day, idx) => {
                  const MoodIcon = day.mood
                    ? MOODS[day.mood as keyof typeof MOODS]?.icon
                    : Meh;
                  const colorClass = day.mood
                    ? MOODS[day.mood as keyof typeof MOODS]?.color
                    : "text-muted-foreground/30";
                  const bgClass = day.mood
                    ? MOODS[day.mood as keyof typeof MOODS]?.bg
                    : "bg-muted/50";

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-3 group"
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                          bgClass
                        )}
                      >
                        <MoodIcon className={cn("h-6 w-6", colorClass)} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {format(day.date, "EEE")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Main Chart & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Daily Mood Trend
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                How your feelings change day by day (Last 14 days).
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis hide domain={[0, 6]} />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="mood"
                      radius={[8, 8, 8, 8]}
                      barSize={16}
                      fill="currentColor"
                      className="fill-primary/20 hover:fill-primary transition-colors duration-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights / Correlation */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Insights
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                What affects your mood?
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Positives */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Smile className="h-4 w-4 text-green-500" />
                  What makes you feel good
                </h4>
                {insights.happyTasks.length > 0 ? (
                  <div className="space-y-2">
                    {insights.happyTasks.slice(0, 3).map((t, i) => (
                      <div
                        key={i}
                        className="bg-background/80 p-3 rounded-lg text-sm border shadow-sm truncate"
                      >
                        {t.taskName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No high-mood tasks tracked recently.
                  </p>
                )}
              </div>

              {/* Negatives */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Frown className="h-4 w-4 text-orange-500" />
                  What leaves you frustrated
                </h4>
                {insights.drainedTasks.length > 0 ? (
                  <div className="space-y-2">
                    {insights.drainedTasks.slice(0, 3).map((t, i) => (
                      <div
                        key={i}
                        className="bg-background/80 p-3 rounded-lg text-sm border shadow-sm truncate"
                      >
                        {t.taskName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No low-mood tasks tracked recently.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
