import { useState } from 'react';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { exportMaintenancePlanToExcel, getDateRange } from '@/utils/excelExport';
import { mockWorkOrders, mockAssets, calendarEvents } from '@/data/mockData';
import { format, addWeeks, addMonths, addQuarters } from 'date-fns';
import { vi } from 'date-fns/locale';

type Period = 'week' | 'month' | 'quarter';

export function ExportMaintenancePlan() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (period: Period, offset: number = 0) => {
    setIsExporting(true);
    try {
      // Load work orders from localStorage or use mock data
      const raw = localStorage.getItem('workOrders');
      const workOrders = raw ? JSON.parse(raw) : mockWorkOrders;

      // Calculate reference date based on offset
      let referenceDate = new Date();
      if (period === 'week') {
        referenceDate = addWeeks(referenceDate, offset);
      } else if (period === 'month') {
        referenceDate = addMonths(referenceDate, offset);
      } else {
        referenceDate = addQuarters(referenceDate, offset);
      }

      const result = exportMaintenancePlanToExcel(
        workOrders,
        calendarEvents,
        mockAssets,
        period,
        referenceDate
      );

      toast.success(`Đã xuất ${result.rowCount} công việc ra file ${result.filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Có lỗi khi xuất file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const periodOptions: { period: Period; label: string; icon: string }[] = [
    { period: 'week', label: 'Tuần', icon: '📅' },
    { period: 'month', label: 'Tháng', icon: '📆' },
    { period: 'quarter', label: 'Quý', icon: '📊' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">Xuất kế hoạch</span>
          <Download className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Xuất kế hoạch bảo trì
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Current Period */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Kỳ hiện tại
        </DropdownMenuLabel>
        {periodOptions.map(({ period, label, icon }) => {
          const { label: rangeLabel } = getDateRange(period);
          return (
            <DropdownMenuItem
              key={period}
              onClick={() => handleExport(period, 0)}
              className="cursor-pointer"
            >
              <span className="mr-2">{icon}</span>
              {label} này
              <span className="ml-auto text-xs text-muted-foreground">
                {rangeLabel}
              </span>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        {/* Next Period */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Kỳ tiếp theo
        </DropdownMenuLabel>
        {periodOptions.map(({ period, label, icon }) => {
          let nextDate = new Date();
          if (period === 'week') nextDate = addWeeks(nextDate, 1);
          else if (period === 'month') nextDate = addMonths(nextDate, 1);
          else nextDate = addQuarters(nextDate, 1);
          
          const { label: rangeLabel } = getDateRange(period, nextDate);
          return (
            <DropdownMenuItem
              key={`next-${period}`}
              onClick={() => handleExport(period, 1)}
              className="cursor-pointer"
            >
              <span className="mr-2">{icon}</span>
              {label} sau
              <span className="ml-auto text-xs text-muted-foreground">
                {rangeLabel}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
