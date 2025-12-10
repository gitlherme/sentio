export interface Project {
  id: string;
  name: string;
  color?: string;
  type: string;
}

export interface Label {
  id: string;
  name: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  date?: string;
  dueDate?: string;
  projectId?: string;
  project?: Project;
  labels: { label: Label }[];
  createdAt: string;
}

export interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
  habitId: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: string[];
  period: string;
  goal: number;
  startDate: string;
  endDate?: string | null;
  logs: HabitLog[];
}

export interface MoodLog {
  id: string;
  mood: number;
  note?: string;
  date: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: string;
  date?: string;
  dueDate?: string;
  projectId?: string;
  labelIds?: string[];
  completed?: boolean;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  id: string;
}

export interface CreateHabitDTO {
  title: string;
  description?: string;
  frequency: string[];
  period: string;
  goal: number;
  startDate: string;
  endDate?: string;
}
