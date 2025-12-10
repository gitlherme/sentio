"use client";

import { Input } from "@/components/ui/input";
import { Task } from "@/lib/types";
import { Search } from "lucide-react";
import { useState } from "react";
import { TaskItem } from "./task-item";

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (id: string) => void;
  onAddTask: () => void;
  onToggleTask: (id: string) => void;
}

export function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  onAddTask,
  onToggleTask,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group tasks by project
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const projectName = task.project?.name || "General";
    if (!acc[projectName]) {
      acc[projectName] = [];
    }
    acc[projectName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort project names to ensure "General" might be last or first?
  // Let's just sort alphabetically for now, or maybe General last if we care.
  const projectNames = Object.keys(groupedTasks).sort((a, b) => {
    if (a === "General") return -1; // General first
    if (b === "General") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/50 border-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {projectNames.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
            <p>No tasks found</p>
          </div>
        ) : (
          projectNames.map((projectName) => (
            <div key={projectName} className="space-y-1">
              <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <span>{projectName}</span>
                <div className="h-px bg-border flex-1" />
              </div>
              {groupedTasks[projectName].map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onClick={() => onSelectTask(task.id)}
                  onToggle={() => onToggleTask(task.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
