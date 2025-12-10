"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EisenhowerMatrixProps {
  tasks: Task[];
  onUpdateTask: (task: { id: string; completed: boolean }) => void;
  onSelectTask: (task: Task) => void;
}

export function EisenhowerMatrix({
  tasks,
  onUpdateTask,
  onSelectTask,
}: EisenhowerMatrixProps) {
  const quadrants = [
    {
      title: "Do First",
      subtitle: "Urgent & Important",
      // Mapping PRIORITY HIGH -> Urgent/Important
      filter: (t: Task) => t.priority === "HIGH" && !t.completed,
      color: "bg-red-500/10 hover:bg-red-500/20",
      borderColor: "border-red-500/20",
      textColor: "text-red-500",
    },
    {
      title: "Schedule",
      subtitle: "Not Urgent & Important",
      // Mapping PRIORITY MEDIUM -> Not Urgent/Important
      filter: (t: Task) => t.priority === "MEDIUM" && !t.completed,
      color: "bg-blue-500/10 hover:bg-blue-500/20",
      borderColor: "border-blue-500/20",
      textColor: "text-blue-500",
    },
    {
      title: "Delegate",
      subtitle: "Urgent & Not Important",
      // Mapping PRIORITY LOW -> Urgent/Not Important (or just low priority)
      filter: (t: Task) => t.priority === "LOW" && !t.completed,
      color: "bg-green-500/10 hover:bg-green-500/20",
      borderColor: "border-green-500/20",
      textColor: "text-green-500",
    },
    {
      title: "Done",
      subtitle: "Completed Tasks",
      filter: (t: Task) => t.completed,
      color: "bg-muted/30 hover:bg-muted/50",
      borderColor: "border-muted/50",
      textColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full pb-8">
      {quadrants.map((quad, idx) => {
        const quadTasks = tasks.filter(quad.filter);
        return (
          <Card
            key={idx}
            className={cn(
              "flex flex-col border-none shadow-sm h-full max-h-[500px] transition-colors relative overflow-hidden backdrop-blur-sm",
              quad.color
            )}
          >
            {/* Decorative colored stripe */}
            <div
              className={cn(
                "absolute top-0 left-0 w-full h-1",
                quad.borderColor.replace("border-", "bg-")
              )}
            />

            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle
                    className={cn(
                      "text-xl font-bold font-display tracking-tight",
                      quad.textColor
                    )}
                  >
                    {quad.title}
                  </CardTitle>
                  <p
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider mt-1 opacity-80",
                      quad.textColor
                    )}
                  >
                    {quad.subtitle}
                  </p>
                </div>
                <div
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full bg-white/50 dark:bg-black/20",
                    quad.textColor
                  )}
                >
                  {quadTasks.length}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto relative z-10 custom-scrollbar pr-2">
              {quadTasks.length === 0 ? (
                <div className="flex items-center justify-center h-[100px] opacity-30">
                  <p
                    className={cn("text-sm italic font-medium", quad.textColor)}
                  >
                    Empty
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quadTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)} // Trigger selection on row click
                      className="flex items-center gap-3 bg-card/80 p-3 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-primary/20 group cursor-pointer"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening modal when checking off
                          onUpdateTask({
                            id: task.id,
                            completed: !task.completed,
                          });
                        }}
                        className={cn(
                          "h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center transition-all hover:border-primary/50",
                          task.completed && "bg-primary border-primary"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors",
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
