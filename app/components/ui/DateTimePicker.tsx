"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de as dateLocale } from "date-fns/locale";
import { de } from "react-day-picker/locale";
import { CalendarDays, ChevronDown, Clock } from "lucide-react";
import { Calendar } from "@/app/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/shadcn/popover";

const DEFAULT_TIME = "18:00";

const fieldClass =
  "flex min-h-[3.25rem] items-center gap-2.5 rounded-2xl bg-white/8 px-4 text-cream border border-white/12 outline-none transition-all duration-200 focus-visible:bg-white/12 focus-visible:border-gold/50 focus-visible:shadow-[0_0_0_3px_rgb(248_201_74/0.12)] disabled:opacity-50";

export default function DateTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [datePart = "", timePart = ""] = value.split("T");
  const date = datePart ? new Date(`${datePart}T00:00`) : undefined;

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`${fieldClass} min-w-0 flex-1 text-left`}
          >
            <CalendarDays className="w-5 h-5 shrink-0 text-gold" aria-hidden />
            <span
              className={`flex-1 truncate ${date ? "" : "text-cream/35"}`}
            >
              {date
                ? format(date, "EEE, d. MMMM yyyy", { locale: dateLocale })
                : "Datum wählen"}
            </span>
            <ChevronDown
              className="w-4 h-4 shrink-0 text-cream/50"
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto overflow-hidden rounded-2xl border-white/12 p-0 shadow-xl"
        >
          <Calendar
            mode="single"
            locale={de}
            selected={date}
            defaultMonth={date}
            onSelect={(next) => {
              if (!next) return;
              onChange(
                `${format(next, "yyyy-MM-dd")}T${timePart || DEFAULT_TIME}`,
              );
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <label className={`${fieldClass} w-32 shrink-0`}>
        <Clock className="w-5 h-5 shrink-0 text-gold" aria-hidden />
        <input
          type="time"
          value={timePart}
          onChange={(e) =>
            e.target.value && onChange(`${datePart}T${e.target.value}`)
          }
          disabled={!date}
          aria-label="Uhrzeit"
          className="w-full min-w-0 bg-transparent outline-none [color-scheme:dark] disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:hidden"
        />
      </label>
    </div>
  );
}
