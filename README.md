# Sentio.

![Sentio Cover](/readme-cover.png)

**Sentio** is a modern productivity application designed to help you master your habits, manage tasks efficiently, and track your well-being. Built with a focus on aesthetics and user experience, Sentio brings your productivity tools into one cohesive, beautiful interface.

## 🚀 Features

### ✨ Smart Habit Tracking

Build and maintain positive habits with our intuitive tracker. Monitor your daily progress, view streaks, and visualize your consistency over time.

### ✅ Advanced Task Management

Organize your life with powerful task management tools:

- **List View:** Simple and effective for daily todos.
- **Kanban Board:** Visualize your workflow and progress with drag-and-drop.
- **Eisenhower Matrix:** Prioritize tasks by urgency and importance.

### 🧠 Focus & Mood

- **Focus Mode:** Eliminate distractions and concentrate on what matters.
- **Mood Tracker:** Log your daily mood and uncover patterns between your feelings and productivity.

### 📊 Data Insights

Gain valuable insights into your behavior with comprehensive analytics and charts, powered by Recharts.

### 🎨 Modern & Responsive Design

- **Dark Mode Support:** Seamlessly switch between light and dark themes.
- **Premium UI:** Crafted with Tailwind CSS and Radix UI for a polished, accessible experience.

## 🛠️ Tech Stack

Sentio is built with a cutting-edge stack for performance, scalability, and developer experience:

- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (with [Prisma ORM](https://www.prisma.io/))
- **Authentication:** [Better Auth](https://github.com/better-auth/better-auth)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [TanStack Query](https://tanstack.com/query/latest)
- **Charts:** [Recharts](https://recharts.org/)
- **Drag & Drop:** [dnd-kit](https://dndkit.com/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v20 or higher recommended)
- **Docker** (for running the PostgreSQL database)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/sentio.git
    cd sentio
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Environment Setup:**

    Create a `.env` file in the root directory (copy from `.env.example` if available) and configure your database connection and authentication secrets.

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/sentio_db"
    BETTER_AUTH_SECRET="your-secret-here"
    BETTER_AUTH_URL="http://localhost:3000"
    ```

4.  **Start the Database:**

    If you accept the Docker setup, ensure Docker is running and start the services:

    ```bash
    docker-compose up -d
    ```

5.  **Initialize the Database:**

    Run Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev
    ```

6.  **Run the Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License.
