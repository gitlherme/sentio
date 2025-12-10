"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTask, useLabels, useProjects } from "@/hooks/use-queries";
import { useState } from "react";

interface TaskFormProps {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const createTaskMutation = useCreateTask();
  const { data: projects = [] } = useProjects();
  const { data: labels = [] } = useLabels();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Map Eisenhower to Priority
    let priority = "LOW";
    if (isUrgent && isImportant) priority = "HIGH";
    else if (isImportant) priority = "MEDIUM";
    else if (isUrgent) priority = "LOW"; // or separate logic

    createTaskMutation.mutate({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      priority,
      projectId: selectedProjectId || undefined,
      labelIds: selectedLabelIds,
    });

    setTitle("");
    setDescription("");
    setDueDate("");
    setIsUrgent(false);
    setIsImportant(false);
    setSelectedProjectId("");
    setSelectedLabelIds([]);
    onSuccess?.();
  };

  const toggleLabel = (id: string) => {
    if (selectedLabelIds.includes(id)) {
      setSelectedLabelIds((prev) => prev.filter((l) => l !== id));
    } else {
      setSelectedLabelIds((prev) => [...prev, id]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="date">Due Date</Label>
        <Input
          id="date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="project">Project</Label>
        <select
          id="project"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="">No Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Labels</Label>
        <div className="flex flex-wrap gap-2">
          {labels.map((l) => (
            <Button
              key={l.id}
              type="button"
              variant={selectedLabelIds.includes(l.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLabel(l.id)}
              className="h-7 text-xs"
            >
              {l.name}
            </Button>
          ))}
          {labels.length === 0 && (
            <span className="text-xs text-muted-foreground">
              No labels created.
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
          />
          Urgent
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={isImportant}
            onChange={(e) => setIsImportant(e.target.checked)}
          />
          Important
        </label>
      </div>
      <DialogFooter>
        <Button type="submit" variant="premium">
          Create Task
        </Button>
      </DialogFooter>
    </form>
  );
}
