"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TaskLayoutProps {
  sidebar: ReactNode;
  details?: ReactNode; // Make optional
  className?: string;
  fullWidth?: boolean;
}

export function TaskLayout({
  sidebar,
  details,
  className,
  fullWidth = false,
}: TaskLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-[calc(100vh-4rem)] overflow-hidden bg-background",
        className
      )}
    >
      <aside
        className={cn(
          "border-r border-border flex flex-col transition-all duration-300",
          fullWidth ? "w-full border-none" : "w-full md:w-[400px]"
        )}
      >
        {sidebar}
      </aside>
      {!fullWidth && (
        <main className="flex-1 overflow-y-auto bg-background/50 relative hidden md:block">
          {details}
        </main>
      )}
    </div>
  );
}
