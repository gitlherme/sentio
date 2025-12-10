import { Habit } from "./types";

export function getHabitStats(habit: Habit) {
  const completedLogs = habit.logs?.filter((l) => l.completed) || [];

  // Set of YYYY-MM-DD
  const completedDates = new Set(
    completedLogs.map((l) => new Date(l.date).toISOString().split("T")[0])
  );

  // Calculate Streak
  let streak = 0;
  const today = new Date();

  // Check today or yesterday to start streak
  // If today is completed, streak starts today.
  // If not, check yesterday. If yesterday completed, streak is active.
  // If neither, streak is 0.

  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentCheckDate = today;

  if (completedDates.has(todayStr)) {
    // Streak includes today
  } else if (completedDates.has(yesterdayStr)) {
    // Streak continues from yesterday
    currentCheckDate = yesterday;
  } else {
    // Streak broken
    return { completedDates, streak: 0 };
  }

  // Count backwards
  while (true) {
    const dateStr = currentCheckDate.toISOString().split("T")[0];
    if (completedDates.has(dateStr)) {
      streak++;
      currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { completedDates, streak };
}
