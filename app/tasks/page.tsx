"use client";

import AppLayout from "@/components/layout/app-layout";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { EisenhowerMatrix } from "@/components/tasks/enseinhower-matrix";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { MoodModal } from "@/components/tasks/mood-modal";
import { TaskDetails } from "@/components/tasks/task-details";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskLayout } from "@/components/tasks/task-layout";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogMood, useTasks, useUpdateTask } from "@/hooks/use-queries";
import { Mood } from "@/store/useStore";
import {
  CheckCircle2,
  Kanban,
  LayoutGrid,
  ListTodo,
  MoreVertical,
  Plus,
} from "lucide-react";
import { useState } from "react";

type ViewType = "list" | "board" | "matrix";

export default function TasksPage() {
  const { data: tasks = [] } = useTasks();
  const updateTaskMutation = useUpdateTask();
  const logMood = useLogMood();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [view, setView] = useState<ViewType>("list");

  // Mood Tracking State
  const [moodModalOpen, setMoodModalOpen] = useState(false);
  const [selectedTaskForMood, setSelectedTaskForMood] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const handleToggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (!task.completed) {
      // Completing: Show mood modal
      setSelectedTaskForMood({ id: task.id, title: task.title });
      setMoodModalOpen(true);
    } else {
      // Uncompleting
      updateTaskMutation.mutate({
        id,
        completed: false,
      });
    }
  };

  const handleMoodSelect = (moodVal: Mood) => {
    if (selectedTaskForMood) {
      // Map mood string to number
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
        note: `Completed task: ${selectedTaskForMood.title}`,
      });

      updateTaskMutation.mutate({
        id: selectedTaskForMood.id,
        completed: true,
      });

      setMoodModalOpen(false);
      setSelectedTaskForMood(null);
    }
  };

  return (
    <AppLayout>
      <MoodModal
        isOpen={moodModalOpen}
        onClose={() => setMoodModalOpen(false)}
        onSelectMood={handleMoodSelect}
        taskTitle={selectedTaskForMood?.title || ""}
      />

      <CreateProjectDialog
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
      />

      <TaskLayout
        fullWidth={view !== "list"}
        sidebar={
          <div className="flex flex-col h-full">
            {/* Custom Toolbar above List */}
            <div className="p-4 border-b border-border flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-display">Tasks</h2>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    onClick={() => setIsTaskModalOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" /> New Task
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsProjectModalOpen(true)}
                      >
                        Create Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* View Switcher */}
              <Tabs
                value={view}
                onValueChange={(v) => {
                  setView(v as ViewType);
                  setSelectedTaskId(null); // Clear selection on view change
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4" /> List
                  </TabsTrigger>
                  <TabsTrigger
                    value="board"
                    className="flex items-center gap-2"
                  >
                    <Kanban className="h-4 w-4" /> Board
                  </TabsTrigger>
                  <TabsTrigger
                    value="matrix"
                    className="flex items-center gap-2"
                  >
                    <LayoutGrid className="h-4 w-4" /> Matrix
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
              {view === "list" && (
                <TaskList
                  tasks={tasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={setSelectedTaskId}
                  onAddTask={() => setIsTaskModalOpen(true)}
                  onToggleTask={handleToggleTask}
                />
              )}
              {view === "board" && (
                <div className="h-full overflow-y-auto p-4">
                  <KanbanBoard
                    tasks={tasks}
                    onUpdateTask={updateTaskMutation.mutate}
                    onSelectTask={(task) => setSelectedTaskId(task.id)}
                  />
                </div>
              )}
              {view === "matrix" && (
                <div className="h-full overflow-y-auto p-4">
                  <EisenhowerMatrix
                    tasks={tasks}
                    onUpdateTask={updateTaskMutation.mutate}
                    onSelectTask={(task) => setSelectedTaskId(task.id)}
                  />
                </div>
              )}
            </div>
          </div>
        }
        details={
          view === "list" ? (
            selectedTask ? (
              <TaskDetails key={selectedTask.id} task={selectedTask} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <div className="bg-muted p-6 rounded-full mb-6 animate-pulse-slow">
                  <CheckCircle2 className="h-12 w-12 opacity-20" />
                </div>
                <p className="text-xl font-medium mb-2">No task selected</p>
                <p className="text-sm max-w-[250px]">
                  Select a task from the list to view details or start a new
                  one.
                </p>
                {tasks.length === 0 && (
                  <Button
                    onClick={() => setIsTaskModalOpen(true)}
                    variant="outline"
                    className="mt-6"
                  >
                    Create your first task
                  </Button>
                )}
              </div>
            )
          ) : null
        }
      />

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setIsTaskModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal for Task Details in Board/Matrix Views */}
      <Dialog
        open={!!(view !== "list" && selectedTaskId)}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="hidden">
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="-m-6">
              <TaskDetails task={selectedTask} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
