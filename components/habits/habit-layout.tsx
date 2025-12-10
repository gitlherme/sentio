"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HabitLayoutProps {
  sidebar: ReactNode;
  details: ReactNode;
  className?: string;
}

export function HabitLayout({ sidebar, details, className }: HabitLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-[calc(100vh-4rem)] overflow-hidden bg-background",
        className
      )}
    >
      <aside className="w-full md:w-[400px] border-r border-border flex flex-col">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-y-auto bg-background/50 relative">
        {details}
      </main>
    </div>
  );
}
