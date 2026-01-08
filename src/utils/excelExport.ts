import * as XLSX from 'xlsx';
import { WorkOrder, Asset, CalendarEvent } from '@/types/maintenance';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, isWithinInterval, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

type Period = 'week' | 'month' | 'quarter';

interface MaintenancePlanRow {
  'STT': number;
  'Mã thiết bị': string;
  'Tên thiết bị': string;
  'Vị trí': string;
  'Loại bảo trì': string;
  'Ngày dự kiến': string;
  'Mô tả công việc': string;
  'Người phụ trách': string;
  'Độ ưu tiên': string;
  'Trạng thái': string;
}

const priorityLabels: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp',
};

const statusLabels: Record<string, string> = {
  open: 'Đang mở',
  in_progress: 'Đang xử lý',
  done: 'Hoàn thành',
  overdue: 'Quá hạn',
};

export function getDateRange(period: Period, referenceDate: Date = new Date()) {
  switch (period) {
    case 'week':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
        label: `Tuần ${format(referenceDate, "'ngày' dd/MM/yyyy", { locale: vi })}`,
      };
    case 'month':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate),
        label: format(referenceDate, "'Tháng' MM/yyyy", { locale: vi }),
      };
    case 'quarter':
      return {
        start: startOfQuarter(referenceDate),
        end: endOfQuarter(referenceDate),
        label: `Quý ${Math.ceil((referenceDate.getMonth() + 1) / 3)}/${referenceDate.getFullYear()}`,
      };
  }
}

export function filterMaintenanceByPeriod(
  workOrders: WorkOrder[],
  calendarEvents: CalendarEvent[],
  assets: Asset[],
  period: Period,
  referenceDate: Date = new Date()
): MaintenancePlanRow[] {
  const { start, end } = getDateRange(period, referenceDate);
  const rows: MaintenancePlanRow[] = [];
  let stt = 1;

  // Filter work orders by due date
  workOrders.forEach(wo => {
    const dueDate = parseISO(wo.dueDate);
    if (isWithinInterval(dueDate, { start, end })) {
      const asset = assets.find(a => a.id === wo.assetId);
      rows.push({
        'STT': stt++,
        'Mã thiết bị': wo.assetId,
        'Tên thiết bị': wo.assetName || asset?.name || '-',
        'Vị trí': asset?.location || '-',
        'Loại bảo trì': wo.source === 'TBM' ? 'TBM (Định kỳ)' : wo.source === 'CBM' ? 'CBM (Theo tình trạng)' : 'Thủ công',
        'Ngày dự kiến': format(dueDate, 'dd/MM/yyyy'),
        'Mô tả công việc': wo.title,
        'Người phụ trách': wo.assignee || 'Chưa phân công',
        'Độ ưu tiên': priorityLabels[wo.priority] || wo.priority,
        'Trạng thái': statusLabels[wo.status] || wo.status,
      });
    }
  });

  // Add calendar events (scheduled maintenance)
  calendarEvents.forEach(event => {
    const eventDate = parseISO(event.date);
    if (isWithinInterval(eventDate, { start, end })) {
      // Check if already in work orders
      const existsInWO = rows.some(r => 
        r['Ngày dự kiến'] === format(eventDate, 'dd/MM/yyyy') && 
        r['Mã thiết bị'] === event.assetId
      );
      if (!existsInWO) {
        const asset = assets.find(a => a.id === event.assetId);
        rows.push({
          'STT': stt++,
          'Mã thiết bị': event.assetId || '-',
          'Tên thiết bị': event.assetName || asset?.name || '-',
          'Vị trí': asset?.location || '-',
          'Loại bảo trì': event.type === 'TBM' ? 'TBM (Định kỳ)' : 'CBM (Theo tình trạng)',
          'Ngày dự kiến': format(eventDate, 'dd/MM/yyyy'),
          'Mô tả công việc': event.title,
          'Người phụ trách': 'Chưa phân công',
          'Độ ưu tiên': 'Trung bình',
          'Trạng thái': 'Kế hoạch',
        });
      }
    }
  });

  // Sort by date
  rows.sort((a, b) => {
    const dateA = a['Ngày dự kiến'].split('/').reverse().join('-');
    const dateB = b['Ngày dự kiến'].split('/').reverse().join('-');
    return dateA.localeCompare(dateB);
  });

  // Re-number
  rows.forEach((row, idx) => {
    row['STT'] = idx + 1;
  });

  return rows;
}

export function exportMaintenancePlanToExcel(
  workOrders: WorkOrder[],
  calendarEvents: CalendarEvent[],
  assets: Asset[],
  period: Period,
  referenceDate: Date = new Date()
) {
  const { label } = getDateRange(period, referenceDate);
  const rows = filterMaintenanceByPeriod(workOrders, calendarEvents, assets, period, referenceDate);

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Add title row
  const titleRow = [`KẾ HOẠCH BẢO TRÌ - ${label.toUpperCase()}`];
  const exportDateRow = [`Ngày xuất: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`];
  
  // Create worksheet with data
  const ws = XLSX.utils.aoa_to_sheet([
    titleRow,
    exportDateRow,
    [], // Empty row
  ]);

  // Add data starting from row 4
  XLSX.utils.sheet_add_json(ws, rows, { origin: 'A4' });

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },   // STT
    { wch: 12 },  // Mã thiết bị
    { wch: 25 },  // Tên thiết bị
    { wch: 20 },  // Vị trí
    { wch: 18 },  // Loại bảo trì
    { wch: 12 },  // Ngày dự kiến
    { wch: 35 },  // Mô tả công việc
    { wch: 18 },  // Người phụ trách
    { wch: 12 },  // Độ ưu tiên
    { wch: 12 },  // Trạng thái
  ];

  // Merge title cells
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Title row
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Export date row
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Kế hoạch bảo trì');

  // Generate filename
  const periodMap = { week: 'Tuan', month: 'Thang', quarter: 'Quy' };
  const dateStr = format(referenceDate, 'yyyy-MM-dd');
  const filename = `KeHoachBaoTri_${periodMap[period]}_${dateStr}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);

  return { filename, rowCount: rows.length };
}

// Export work order summary
export function exportWorkOrderSummaryToExcel(workOrders: WorkOrder[], assets: Asset[]) {
  const rows = workOrders.map((wo, idx) => {
    const asset = assets.find(a => a.id === wo.assetId);
    return {
      'STT': idx + 1,
      'Mã WO': wo.id,
      'Tiêu đề': wo.title,
      'Mã thiết bị': wo.assetId,
      'Tên thiết bị': wo.assetName || asset?.name || '-',
      'Nguồn': wo.source,
      'Trạng thái': statusLabels[wo.status] || wo.status,
      'Độ ưu tiên': priorityLabels[wo.priority] || wo.priority,
      'Người phụ trách': wo.assignee || 'Chưa phân công',
      'Ngày tạo': format(parseISO(wo.createdAt), 'dd/MM/yyyy'),
      'Hạn hoàn thành': format(parseISO(wo.dueDate), 'dd/MM/yyyy'),
      'Ngày hoàn thành': wo.completedAt ? format(parseISO(wo.completedAt), 'dd/MM/yyyy') : '-',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 5 },
    { wch: 15 },
    { wch: 35 },
    { wch: 12 },
    { wch: 25 },
    { wch: 8 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách WO');

  const filename = `DanhSachLenhCongViec_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, filename);

  return { filename, rowCount: rows.length };
}
