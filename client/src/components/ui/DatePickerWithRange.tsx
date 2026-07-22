import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays, X } from "lucide-react";
import { format } from "date-fns";

interface DatePickerWithRangeProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (d: string) => void;
  onDateToChange: (d: string) => void;
}

export function DatePickerWithRange({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fromDate = dateFrom ? new Date(dateFrom) : undefined;
  const toDate = dateTo ? new Date(dateTo) : undefined;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      onDateFromChange(format(range.from, "yyyy-MM-dd"));
      if (range.to) {
        onDateToChange(format(range.to, "yyyy-MM-dd"));
      }
    }
    if (range?.to) setOpen(false);
  };

  const clear = () => {
    onDateFromChange("");
    onDateToChange("");
    setOpen(false);
  };

  const display = dateFrom
    ? `${dateFrom}${dateTo ? ` — ${dateTo}` : ""}`
    : "Select date range";

  return (
    <div ref={ref} className="relative">
      <div className="flex gap-1 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className="text-xs gap-1.5"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          {display}
        </Button>
        {(dateFrom || dateTo) && (
          <button
            onClick={clear}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
          <Calendar
            mode="range"
            selected={{ from: fromDate, to: toDate }}
            onSelect={handleSelect as any}
            defaultMonth={fromDate || new Date()}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  );
}
