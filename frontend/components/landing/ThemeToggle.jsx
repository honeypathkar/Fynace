"use client";

import { useState } from "react";
import { Monitor, Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const themeOptions = [
  { id: "light", label: "Light", Icon: Sun },
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "system", label: "System", Icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const activeTheme = theme || "system";
  const ActiveIcon = themeOptions.find((option) => option.id === activeTheme)?.Icon || Monitor;

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 border border-[var(--line)] bg-[var(--panel)] !text-[var(--text)] shadow-sm hover:bg-[var(--soft)] hover:!text-[var(--text)]"
        onClick={() => setOpen((current) => !current)}
        aria-label="Toggle theme"
      >
        <ActiveIcon size={16} className="text-[var(--text)]" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-36 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-lg">
          {themeOptions.map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => {
                setTheme(id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                activeTheme === id
                  ? "bg-[var(--soft)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--soft)] hover:text-[var(--text)]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
