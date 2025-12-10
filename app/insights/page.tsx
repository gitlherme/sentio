"use client";

import AppLayout from "@/components/layout/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { format, subDays } from "date-fns";
import { Brain, TrendingUp, Zap } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function InsightsPage() {
  const { tasks, habits } = useStore();

  // Mock Data Generation for Demo Purposes
  // In a real app, we would aggregate this from `tasks` where `completionDate` is stored,
  // and `mood` logs coupled with timestamps.
  // Since our store is simple, I will generate plausible mock data based on the last 7 days.

  const generateData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "EEE");

      // Random productivity (tasks completed)
      const tasksCompleted = Math.floor(Math.random() * 8) + 2;
      // Random Mood Score (1-10)
      const moodScore = Math.floor(Math.random() * 4) + 6;

      data.push({
        name: dateStr,
        tasks: tasksCompleted,
        mood: moodScore,
      });
    }
    return data;
  };

  const data = generateData();

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold font-display text-foreground tracking-tight">
            Insights & Analytics
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            Understand your patterns. Optimize your flow.
          </p>
        </div>

        {/* AI Insight Card - Hero */}
        <Card className="border-none shadow-md bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 dark:from-violet-900/20 dark:to-fuchsia-900/20 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain className="w-32 h-32" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                AI Analysis
              </span>
            </div>
            <CardTitle className="font-display text-2xl">
              Weekly Pattern Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 max-w-2xl">
            <p className="text-lg text-foreground/90 leading-relaxed font-medium">
              &quot;You consistently hit peak flow state on Tuesday mornings.
              Your mood correlates strongly with completing creative tasks early
              in the day.&quot;
            </p>
            <div className="mt-6 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>+15% Productivity vs last week</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>3.5hrs Avg Deep Work</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood vs Productivity Chart */}
          <Card className="border-none shadow-sm bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Mood & Output
              </CardTitle>
              <CardDescription>
                Correlation between how you feel and what you get done.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/30"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="tasks"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                    fillOpacity={0.8}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 0, fill: "#8b5cf6" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Breakdown (Mockup) */}
          <Card className="border-none shadow-sm bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                Focus Distribution
              </CardTitle>
              <CardDescription>Where your time went this week.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                {["Deep Work", "Meetings", "Learning", "Admin"].map(
                  (category, i) => (
                    <div
                      key={category}
                      className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-transparent hover:border-border/50 transition-all flex flex-col justify-between h-32"
                    >
                      <span className="text-muted-foreground text-sm font-medium">
                        {category}
                      </span>
                      <span className="text-3xl font-display font-bold text-foreground">
                        {25 - i * 5}%
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
