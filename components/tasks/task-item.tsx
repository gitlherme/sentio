"use client";

import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onClick: () => void;
  onToggle: () => void;
}

export function TaskItem({
  task,
  isSelected,
  onClick,
  onToggle,
}: TaskItemProps) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
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
          onClick={handleToggle}
          className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-primary flex-shrink-0",
            task.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-muted-foreground/30"
          )}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </div>

        <div className="min-w-0">
          <h3
            className={cn(
              "font-medium truncate transition-all",
              task.completed && "line-through text-muted-foreground",
              isSelected ? "text-foreground" : ""
            )}
          >
            {task.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
