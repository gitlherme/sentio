"use client";

import UserButton from "@/components/auth/user-button";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  LayoutDashboard,
  Settings,
  Smile,
  Timer,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Habits", href: "/habits", icon: Zap },
  { name: "Focus", href: "/focus", icon: Timer },
  { name: "Mood Tracker", href: "/mood", icon: Smile },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r text-card-foreground transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <h1 className="text-2xl font-bold font-serif tracking-tight text-primary">
          Sentio.
        </h1>
        <ThemeToggle />
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t">
        <nav className="grid gap-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground",
              pathname === "/settings" && "bg-muted text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <div className="px-3 py-2.5">
            <UserButton />
          </div>
        </nav>
      </div>
    </div>
  );
}
