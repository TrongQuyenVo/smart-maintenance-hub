import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
    case 'quarter': {
      const start = startOfQuarter(referenceDate);
      const end = endOfQuarter(referenceDate);
      return {
        start,
        end,
        label: `${format(start, 'MM/yyyy', { locale: vi })} - ${format(end, 'MM/yyyy', { locale: vi })}`,
      };
    }
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
      let maintenanceType = 'Thủ công';
      if (wo.source === 'TBM') maintenanceType = 'TBM (Định kỳ)';
      else if (wo.source === 'CBM') maintenanceType = 'CBM (Theo tình trạng)';

      rows.push({
        'STT': stt++,
        'Mã thiết bị': wo.assetId,
        'Tên thiết bị': wo.assetName || asset?.name || '-',
        'Vị trí': asset?.location || '-',
        'Loại bảo trì': maintenanceType,
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

// Styled exports now implemented using ExcelJS (supports colors, borders, freeze panes, autofilter, etc.)

export async function exportMaintenancePlanToExcel(
  workOrders: WorkOrder[],
  calendarEvents: CalendarEvent[],
  assets: Asset[],
  period: Period,
  referenceDate: Date = new Date()
) {
  const { label } = getDateRange(period, referenceDate);
  const rows = filterMaintenanceByPeriod(workOrders, calendarEvents, assets, period, referenceDate);

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Kế hoạch bảo trì', { views: [{ state: 'frozen', ySplit: 4 }] });

  // Title + export date
  ws.mergeCells('A1:J1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `KẾ HOẠCH BẢO TRÌ - ${label.toUpperCase()}`;
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  ws.mergeCells('A2:J2');
  const dateCell = ws.getCell('A2');
  dateCell.value = `Ngày xuất: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`;
  dateCell.font = { name: 'Calibri', size: 10, italic: true };
  dateCell.alignment = { horizontal: 'center' };

  // Column widths
  ws.columns = [
    { width: 5 }, // STT
    { width: 12 },
    { width: 25 },
    { width: 20 },
    { width: 18 },
    { width: 12 },
    { width: 35 },
    { width: 18 },
    { width: 12 },
    { width: 12 },
  ];

  // Header row (row 4)
  const headers = ['STT','Mã thiết bị','Tên thiết bị','Vị trí','Loại bảo trì','Ngày dự kiến','Mô tả công việc','Người phụ trách','Độ ưu tiên','Trạng thái'];
  const headerRow = ws.getRow(4);
  headerRow.values = headers;
  headerRow.height = 22;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Data rows
  let rowIndex = 5;
  rows.forEach(r => {
    const excelRow = ws.getRow(rowIndex);
    excelRow.values = [
      r['STT'],
      r['Mã thiết bị'],
      r['Tên thiết bị'],
      r['Vị trí'],
      r['Loại bảo trì'],
      r['Ngày dự kiến'],
      r['Mô tả công việc'],
      r['Người phụ trách'],
      r['Độ ưu tiên'],
      r['Trạng thái'],
    ];

    // wrap description
    excelRow.getCell(7).alignment = { wrapText: true, vertical: 'top' };

    // center some columns
    [1,6,9,10].forEach(ci => {
      excelRow.getCell(ci).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // border
    excelRow.eachCell(cell => {
      cell.border = { top: { style: 'thin', color: { argb: 'FFD9D9D9' } }, left: { style: 'thin', color: { argb: 'FFD9D9D9' } }, right: { style: 'thin', color: { argb: 'FFD9D9D9' } }, bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } } };
    });

    // conditional coloring (guard cell values)
    const statusCell = excelRow.getCell(10);
    const statusVal = typeof statusCell.value === 'string' ? statusCell.value : '';
    const s = statusVal.toLowerCase();
    if (s.includes('quá hạn')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4D4F' } };
    } else if (s.includes('đang xử lý')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAAD14' } };
    } else if (s.includes('đang mở')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF40A9FF' } };
    } else if (s.includes('hoàn thành')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF73D13D' } };
    } else if (s.includes('kế hoạch')) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    }


    const priorityCell = excelRow.getCell(9);
    const pr = typeof priorityCell.value === 'string' ? priorityCell.value.toLowerCase() : '';
    if (pr.includes('khẩn')) {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF4D4F' } }; // đỏ
    } else if (pr.includes('cao')) {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC53D' } }; // cam
    } else if (pr.includes('trung')) {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF40A9FF' } }; // xanh dương
    } else if (pr.includes('thấp')) {
      priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF73D13D' } }; // xanh lá
    }

    rowIndex++;
  });

  // autofilter
  const lastRow = 4 + rows.length;
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: lastRow, column: headers.length } };

  // save
  const periodMap = { week: 'Tuan', month: 'Thang', quarter: 'Quy' } as Record<string,string>;
  const dateStr = format(referenceDate, 'yyyy-MM-dd');
  const filename = `KeHoachBaoTri_${periodMap[period]}_${dateStr}.xlsx`;

  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);

  return { filename, rowCount: rows.length };
}

// Export work order summary
export async function exportWorkOrderSummaryToExcel(workOrders: WorkOrder[], assets: Asset[]) {
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

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Danh sách WO', { views: [{ state: 'frozen', ySplit: 4 }] });

  // Title + date
  ws.mergeCells('A1:L1');
  ws.getCell('A1').value = `DANH SÁCH LỆNH CÔNG VIỆC - ${format(new Date(), "'ngày' dd/MM/yyyy", { locale: vi })}`;
  ws.getCell('A1').font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } };
  ws.mergeCells('A2:L2');
  ws.getCell('A2').value = `Ngày xuất: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}`;

  ws.columns = [
    { width: 5 },
    { width: 15 },
    { width: 35 },
    { width: 12 },
    { width: 25 },
    { width: 8 },
    { width: 12 },
    { width: 12 },
    { width: 18 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ];

  const headers = ['STT','Mã WO','Tiêu đề','Mã thiết bị','Tên thiết bị','Nguồn','Trạng thái','Độ ưu tiên','Người phụ trách','Ngày tạo','Hạn hoàn thành','Ngày hoàn thành'];
  const headerRow = ws.getRow(4);
  headerRow.values = [null, ...headers];
  headerRow.eachCell(cell => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F75B5' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  // Data
  let rIdx = 5;
  rows.forEach(r => {
    const er = ws.getRow(rIdx);
    er.values = [null, r['STT'], r['Mã WO'], r['Tiêu đề'], r['Mã thiết bị'], r['Tên thiết bị'], r['Nguồn'], r['Trạng thái'], r['Độ ưu tiên'], r['Người phụ trách'], r['Ngày tạo'], r['Hạn hoàn thành'], r['Ngày hoàn thành']];
    er.getCell(3).alignment = { wrapText: true }; // Tiêu đề wrap

    // borders
    er.eachCell(cell => {
      cell.border = { top: { style: 'thin', color: { argb: 'FFD9D9D9' } }, left: { style: 'thin', color: { argb: 'FFD9D9D9' } }, right: { style: 'thin', color: { argb: 'FFD9D9D9' } }, bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } } };
    });

    // conditional coloring for priority/status (guard values)
    const pCell = er.getCell(8);
    const pr = typeof pCell.value === 'string' ? pCell.value.toLowerCase() : '';
    if (pr.includes('khẩn') || pr.includes('critical')) pCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    else if (pr.includes('cao') || pr.includes('high')) pCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

    const sCell = er.getCell(7);
    const sVal = typeof sCell.value === 'string' ? sCell.value.toLowerCase() : '';
    if (sVal.includes('quá hạn')) sCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };

    rIdx++;
  });

  const lastRow = 4 + rows.length;
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: lastRow, column: headers.length } };

  const filename = `DanhSachLenhCongViec_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename);

  return { filename, rowCount: rows.length };
}
