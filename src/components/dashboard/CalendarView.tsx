import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from 'antd';
import { cn } from '@/lib/utils';
import { calendarEvents, CalendarEvent } from '@/data/mockData';

export function CalendarView() {
  // use real current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();

  // selected date modal
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedEvents = selectedDate ? calendarEvents.filter(e => e.date === selectedDate) : [];

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

  // compute today's date once so we can highlight it in the calendar
  const today = new Date();

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-14 lg:h-16 border-b border-r border-border/50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const events = getEventsForDate(day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasEvents = events.length > 0;
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear(); // real today

      days.push(
        <div
          key={day}
          role={hasEvents ? 'button' : undefined}
          tabIndex={hasEvents ? 0 : undefined}
          title={hasEvents ? `${events.length} sự kiện` : undefined}
          onClick={() => hasEvents && (setSelectedDate(dateStr), setIsModalOpen(true))}
          onKeyDown={(e) => hasEvents && (e.key === 'Enter' || e.key === ' ') && (setSelectedDate(dateStr), setIsModalOpen(true))}
          className={cn(
            'h-12 sm:h-14 lg:h-16 p-0.5 sm:p-1 border-b border-r border-border/50 transition-colors hover:bg-muted/30',
            isToday && 'bg-primary/5',
            hasEvents && 'cursor-pointer'
          )}
        >
          <span className={cn(
            'inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm rounded-full',
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
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border/50">
        <h3 className="text-base sm:text-lg font-semibold">Lịch bảo trì</h3>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="min-w-[100px] sm:min-w-[140px] text-center text-sm sm:text-base font-medium">
            {monthNames[month]} - {year}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 bg-muted/30">
        {dayNames.map(day => (
          <div key={day} className="p-1 sm:p-1.5 text-center text-xs sm:text-sm font-medium text-muted-foreground border-b border-r border-border/50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {renderCalendarDays()}
      </div>

      {/* Day detail modal */}
      <Modal
        title={selectedDate ? `Sự kiện ${new Date(selectedDate).toLocaleDateString('vi-VN')}` : 'Sự kiện'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" variant="ghost" onClick={() => setIsModalOpen(false)}>Đóng</Button>
        ]}
      >
        {selectedEvents.length === 0 ? (
          <p className="text-muted-foreground">Không có sự kiện cho ngày này</p>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((ev, idx) => (
              <div key={idx} className="p-3 border rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-xs text-muted-foreground">Loại: {ev.type}</div>
                    {ev.assetId && <div className="text-xs text-muted-foreground">Thiết bị: {ev.assetName || ev.assetId}</div>}
                  </div>
                  {ev.assetId && (
                    <Button size="sm" onClick={() => { setIsModalOpen(false); navigate(`/assets/${ev.assetId}`); }}>
                      Mở thiết bị
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Legend */}
      <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 border-t border-border/50">
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
