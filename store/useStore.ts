import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// --- Types ---

export type Mood =
  | "happy"
  | "neutral"
  | "sad"
  | "excited"
  | "tired"
  | "active"
  | null;

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string; // ISO Date String
  mood?: Mood;
  categoryId?: string;
  labels: string[];
  createdAt: string;
  isUrgent?: boolean;
  isImportant?: boolean;
}

export type Frequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: Frequency;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  goal: number; // e.g. 1 (once a day)
  goalDays: number; // For "challenge" habits (e.g. 30 days) or -1 for forever
  startDate: string;
  endDate?: string;
  streak: number;
  completedDates: { [date: string]: boolean }; // YYYY-MM-DD -> true
}

interface StoreState {
  tasks: Task[];
  habits: Habit[];
  categories: Category[];

  // Actions
  addTask: (task: Omit<Task, "id" | "createdAt" | "isCompleted">) => void;
  toggleTask: (id: string, mood?: Mood) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  addHabit: (habit: Omit<Habit, "id" | "streak" | "completedDates">) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  addCategory: (category: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;
}

// --- Store ---

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      tasks: [],
      habits: [],
      categories: [
        { id: "1", name: "Personal", color: "#3b82f6" },
        { id: "2", name: "Work", color: "#ef4444" },
      ],

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              isCompleted: false,
              labels: task.labels || [],
            },
          ],
        })),

      toggleTask: (id, mood) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? { ...t, isCompleted: !t.isCompleted, mood: mood ?? t.mood }
              : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: uuidv4(),
              streak: 0,
              completedDates: {},
            },
          ],
        })),

      toggleHabit: (id, date) =>
        set((state) => {
          // Simplistic streak logic: if toggling on, check yesterday.
          // Realistically would need a more robust recalculation function.
          // For now, simple toggle.
          return {
            habits: state.habits.map((h) => {
              if (h.id !== id) return h;
              const isCompletedNow = !h.completedDates[date];
              const newCompletedDates = { ...h.completedDates };
              if (isCompletedNow) {
                newCompletedDates[date] = true;
              } else {
                delete newCompletedDates[date];
              }

              // TODO: Robust streak calculation
              const newStreak = isCompletedNow
                ? h.streak + 1
                : Math.max(0, h.streak - 1);

              return {
                ...h,
                completedDates: newCompletedDates,
                streak: newStreak,
              };
            }),
          };
        }),

      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: uuidv4() }],
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "habits-todo-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
