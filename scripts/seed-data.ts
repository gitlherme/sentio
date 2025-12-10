import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

// Load envs manually since basic tsx doesn't load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    if (!line || line.startsWith("#")) return;
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const val = valueParts
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key.trim()] = val;
    }
  });
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const USER_ID = "cwAzFSyelRDJ38LtV91qYkFf2c5MqGlq";

async function main() {
  console.log(`Starting seed for user: ${USER_ID}`);

  // 1. Clean up existing data for this user
  console.log("Cleaning up existing data...");
  await prisma.habitLog.deleteMany({
    where: { habit: { userId: USER_ID } },
  });
  await prisma.habit.deleteMany({
    where: { userId: USER_ID },
  });

  await prisma.focusSession.deleteMany({
    where: { userId: USER_ID },
  });
  await prisma.labelOnTask.deleteMany({
    where: { task: { userId: USER_ID } },
  });
  await prisma.task.deleteMany({
    where: { userId: USER_ID },
  });
  await prisma.project.deleteMany({
    where: { userId: USER_ID },
  });
  await prisma.label.deleteMany({
    where: { userId: USER_ID },
  });
  await prisma.moodLog.deleteMany({
    where: { userId: USER_ID },
  });

  console.log("Cleanup complete.");

  // 2. Create Habits
  console.log("Creating habits...");

  // Habit 1: Drink Water (Daily, Good Streak)
  const water = await prisma.habit.create({
    data: {
      userId: USER_ID,
      title: "Drink 3L Water",
      description: "Stay hydrated!",
      frequency: ["DAILY"],
      period: "ANYTIME",
      goal: 1,
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Started 30 days ago
    },
  });

  // Log last 10 days for water (Perfect streak)
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Skip today for now so user can check it off? Or check it off to show "Done"?
    // Let's leave today pending for one, done for another.
    if (i === 0) continue; // Leave today pending for water

    await prisma.habitLog.create({
      data: {
        habitId: water.id,
        date: d,
        completed: true,
      },
    });
  }

  // Habit 2: Read (Mon, Wed, Fri)
  const reading = await prisma.habit.create({
    data: {
      userId: USER_ID,
      title: "Read 20 mins",
      description: "Non-fiction books",
      frequency: ["MON", "WED", "FRI"],
      period: "EVENING",
      goal: 1,
      startDate: new Date(new Date().setDate(new Date().getDate() - 20)),
    },
  });

  // Log some random days for reading
  for (let i = 1; i < 15; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // If it's Mon/Wed/Fri
    const day = d.getDay(); // 1=Mon, 3=Wed, 5=Fri
    if ([1, 3, 5].includes(day)) {
      // 80% chance completed
      if (Math.random() > 0.2) {
        await prisma.habitLog.create({
          data: {
            habitId: reading.id,
            date: d,
            completed: true,
          },
        });
      }
    }
  }

  // Habit 3: Gym (Tue, Thu, Sat) - Missed Yesterday if possible
  const gym = await prisma.habit.create({
    data: {
      userId: USER_ID,
      title: "Gym Workout",
      frequency: ["TUE", "THU", "SAT"],
      period: "MORNING",
      goal: 1,
      startDate: new Date(new Date().setDate(new Date().getDate() - 60)),
    },
  });

  // 3. Create Projects
  const workProject = await prisma.project.create({
    data: { userId: USER_ID, name: "Work", color: "#3B82F6", type: "WORK" },
  });
  const homeProject = await prisma.project.create({
    data: { userId: USER_ID, name: "Home", color: "#10B981", type: "PERSONAL" },
  });

  // 4. Create Tasks
  console.log("Creating tasks...");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Overdue Task
  await prisma.task.create({
    data: {
      userId: USER_ID,
      title: "Submit Monthly Report",
      description: "Should have been done yesterday",
      date: yesterday,
      priority: "HIGH",
      projectId: workProject.id,
      completed: false,
    },
  });

  // Today's Tasks
  await prisma.task.create({
    data: {
      userId: USER_ID,
      title: "Review PRs",
      date: today,
      priority: "MEDIUM",
      projectId: workProject.id,
      completed: false,
    },
  });

  await prisma.task.create({
    data: {
      userId: USER_ID,
      title: "Grocery Shopping",
      date: today,
      priority: "LOW",
      projectId: homeProject.id,
      completed: true, // Already done
    },
  });

  // Future Tasks
  await prisma.task.create({
    data: {
      userId: USER_ID,
      title: "Dentist Appointment",
      date: tomorrow,
      priority: "HIGH",
      projectId: homeProject.id,
    },
  });

  await prisma.task.create({
    data: {
      userId: USER_ID,
      title: "Quarterly Planning",
      date: nextWeek,
      priority: "MEDIUM",
      projectId: workProject.id,
    },
  });

  // 5. Create Mood Logs
  console.log("Creating mood logs...");
  // Log moods for last 7 days
  for (let i = 0; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Random mood 1-5
    // Make recent days better
    const moodScore = Math.min(
      5,
      Math.max(1, Math.floor(Math.random() * 3) + (i < 3 ? 3 : 2))
    );

    await prisma.moodLog.create({
      data: {
        userId: USER_ID,
        mood: moodScore,
        note: i === 0 ? "Feeling productive!" : undefined,
        date: d,
      },
    });
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
