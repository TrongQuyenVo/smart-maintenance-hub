import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { calendarEvents } from '@/data/mockData';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1)); // January 2025

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = firstDayOfMonth.getDay();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-20 lg:h-24 border-b border-r border-border/50" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDate(day);
      const isToday = day === 6 && month === 0 && year === 2025; // Mock today
      
      days.push(
        <div
          key={day}
          className={cn(
            'h-16 sm:h-20 lg:h-24 p-1 sm:p-2 border-b border-r border-border/50 transition-colors hover:bg-muted/30',
            isToday && 'bg-primary/5'
          )}
        >
          <span className={cn(
            'inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm rounded-full',
            isToday && 'bg-primary text-primary-foreground font-semibold'
          )}>
            {day}
          </span>
          <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1 hidden sm:block">
            {events.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={cn(
                  'text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded truncate',
                  event.type === 'TBM' ? 'bg-info/20 text-info' : 'bg-warning/20 text-warning'
                )}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <span className="text-[10px] text-muted-foreground">+{events.length - 2}</span>
            )}
          </div>
          {/* Mobile: show dot only */}
          <div className="sm:hidden mt-1 flex gap-0.5">
            {events.slice(0, 2).map((event, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  event.type === 'TBM' ? 'bg-info' : 'bg-warning'
                )}
              />
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50">
        <h3 className="text-base sm:text-lg font-semibold">Lịch bảo trì</h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[100px] sm:min-w-[140px] text-center text-sm sm:text-base font-medium">
            {monthNames[month]} {year}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 bg-muted/30">
        {dayNames.map(day => (
          <div key={day} className="p-1.5 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground border-b border-r border-border/50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-t border-border/50">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-info/50" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">TBM - Định kỳ</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-warning/50" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">CBM - Cảm biến</span>
        </div>
      </div>
    </div>
  );
}
