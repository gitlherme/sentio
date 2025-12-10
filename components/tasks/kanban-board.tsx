"use client";

import { Task } from "@/lib/types"; // Changed from store to types
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTask: (task: { id: string; completed: boolean }) => void;
  onSelectTask: (task: Task) => void;
}

export function KanbanBoard({
  tasks,
  onUpdateTask,
  onSelectTask,
}: KanbanBoardProps) {
  const columns = useMemo(
    () => [
      { id: "todo", title: "To Do", filter: (t: Task) => !t.completed },
      { id: "done", title: "Done", filter: (t: Task) => t.completed },
    ],
    []
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // If dropped in a column
      const columnId = over.id as string;
      // If dropped over a task, find its column (simplified for now to just column containers)

      if (columnId === "todo") {
        onUpdateTask({ id: active.id as string, completed: false });
      } else if (columnId === "done") {
        onUpdateTask({ id: active.id as string, completed: true });
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-6 overflow-x-auto pb-4">
        {columns.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter(col.filter)}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </DndContext>
  );
}

function Column({
  id,
  title,
  tasks,
  onSelectTask,
}: {
  id: string;
  title: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-[320px] flex flex-col gap-4 rounded-3xl bg-muted/30 p-4 border border-border/40"
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold font-display text-lg text-foreground">
          {title}
        </h3>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border shadow-sm">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableTask({
  task,
  onSelectTask,
}: {
  task: Task;
  onSelectTask: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelectTask(task)}
      className={cn(
        "p-4 rounded-2xl bg-card border border-border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-300 group",
        isDragging && "shadow-xl rotate-2 scale-105 border-primary/20"
      )}
    >
      <p className="font-medium text-base text-foreground/90 group-hover:text-primary transition-colors">
        {task.title}
      </p>
      {task.dueDate && (
        <div className="flex items-center gap-2 mt-3">
          <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
          <p className="text-xs text-muted-foreground font-medium">
            {new Date(task.dueDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
