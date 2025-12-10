"use client";

import { MoodModal } from "@/components/tasks/mood-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTask, useLogMood, useUpdateTask } from "@/hooks/use-queries";
import { Task } from "@/lib/types";
import { Mood } from "@/store/useStore";
import { format } from "date-fns";
import { Calendar, Check, Trash2 } from "lucide-react";
import { useState } from "react";

interface TaskDetailsProps {
  task: Task;
}

export function TaskDetails({ task }: TaskDetailsProps) {
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const logMood = useLogMood();

  // Local state initialized with task data
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  const handleSave = () => {
    if (title !== task.title || description !== (task.description || "")) {
      updateTaskMutation.mutate({ id: task.id, title, description });
    }
  };

  const isUrgent = task.priority === "HIGH" || task.priority === "CRITICAL";

  const handleToggle = () => {
    if (!task.completed) {
      // Completing -> Show mood modal
      setMoodModalOpen(true);
    } else {
      // Uncompleting -> Direct mutation
      updateTaskMutation.mutate({ id: task.id, completed: false });
    }
  };

  const handleMoodSelect = (moodVal: Mood) => {
    const moodMap: Record<string, number> = {
      sad: 1,
      tired: 2,
      neutral: 3,
      happy: 4,
      excited: 5,
      active: 5,
    };
    const moodNum = moodMap[moodVal || "neutral"] || 3;

    logMood.mutate({
      mood: moodNum,
      note: `Completed task: ${task.title}`,
    });

    updateTaskMutation.mutate({ id: task.id, completed: true });
    setMoodModalOpen(false);
  };

  return (
    <>
      <MoodModal
        isOpen={moodModalOpen}
        onClose={() => setMoodModalOpen(false)}
        onSelectMood={handleMoodSelect}
        taskTitle={task.title}
      />
      <div className="p-8 h-full flex flex-col">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Badge
              variant={task.completed ? "default" : "outline"}
              className={
                task.completed ? "bg-green-500 hover:bg-green-600" : ""
              }
            >
              {task.completed ? "Completed" : "Pending"}
            </Badge>
            {isUrgent && <Badge variant="destructive">Urgent</Badge>}
            {task.project && (
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
              >
                {task.project.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                updateTaskMutation.mutate({
                  id: task.id,
                  priority: isUrgent ? "MEDIUM" : "HIGH",
                })
              }
              className={
                isUrgent
                  ? "text-red-500 bg-red-500/10"
                  : "text-muted-foreground"
              }
            >
              <div className="h-2 w-2 rounded-full bg-current" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTaskMutation.mutate(task.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 flex-1">
          <input
            className="w-full text-3xl font-bold font-display bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Task title"
          />

          <Textarea
            className="w-full resize-none min-h-[200px] text-lg text-muted-foreground bg-transparent border-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/30"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            placeholder="Add a description..."
          />

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-4 max-w-md pt-8 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Created{" "}
                {task.createdAt
                  ? format(new Date(task.createdAt), "MMM d, yyyy")
                  : "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Action */}
        <div className="pt-4 border-t border-border">
          <Button
            className="w-full h-12 text-lg gap-2"
            variant={task.completed ? "outline" : "default"}
            onClick={handleToggle}
          >
            <Check className="h-5 w-5" />
            {task.completed ? "Mark as Incomplete" : "Mark as Completed"}
          </Button>
        </div>
      </div>
    </>
  );
}
