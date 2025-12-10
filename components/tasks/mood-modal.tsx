"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Mood } from "@/store/useStore";
import { BatteryCharging, Frown, Meh, Smile, Zap } from "lucide-react";

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMood: (mood: Mood) => void;
  taskTitle: string;
}

const moods: {
  value: Mood;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    value: "sad",
    label: "Drained",
    icon: <Frown className="h-6 w-6" />,
    color: "bg-chart-5/10 text-chart-5",
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: <Meh className="h-6 w-6" />,
    color: "bg-muted text-muted-foreground",
  },
  {
    value: "happy",
    label: "Satisfied",
    icon: <Smile className="h-6 w-6" />,
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    value: "excited",
    label: "Energized",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    value: "active",
    label: "Flow State",
    icon: <BatteryCharging className="h-6 w-6" />,
    color: "bg-chart-4/10 text-chart-4",
  },
] as const;

export function MoodModal({
  isOpen,
  onClose,
  onSelectMood,
  taskTitle,
}: MoodModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center pt-4">
            How did this task make you feel?
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-2">
            &quot;{taskTitle}&quot;
          </p>
        </DialogHeader>
        <div className="flex flex-wrap justify-center gap-4 py-8">
          {moods.map((mood) => (
            <div
              key={mood.value}
              className="flex flex-col items-center gap-2 group cursor-pointer"
              onClick={() => onSelectMood(mood.value)}
            >
              <div
                className={cn(
                  "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-sm",
                  mood.color
                )}
              >
                {mood.icon}
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {mood.label}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
