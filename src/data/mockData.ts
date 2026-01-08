/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Asset, 
  WorkOrder, 
  Alert, 
  TelemetryReading, 
  TBMPolicy, 
  CBMPolicy,
  DashboardStats 
} from '@/types/maintenance';

export const mockAssets: Asset[] = [
  {
    id: 'AST-001',
    name: 'AHU-01 Tòa nhà chính',
    type: 'AHU',
    location: 'Tòa nhà A - Tầng 1',
    status: 'online',
    specifications: {
      'Công suất làm lạnh': '50 kW',
      'Lưu lượng khí': '8000 CFM',
      'Công suất tiêu thụ': '15 kW',
    },
    lastMaintenance: '2026-01-02',
    nextMaintenance: '2026-03-15',
    installDate: '2020-06-01',
    manufacturer: 'Carrier',
    model: 'AHU-50K',
  },
  {
    id: 'AST-002',
    name: 'Chiller-01 Trung tâm',
    type: 'Chiller',
    location: 'Mái tòa nhà',
    status: 'warning',
    specifications: {
      'Công suất': '500 TR',
      'Chất làm lạnh': 'R-134a',
      'Công suất tiêu thụ': '350 kW',
    },
    lastMaintenance: '2026-01-03',
    nextMaintenance: '2026-02-20',
    installDate: '2019-03-15',
    manufacturer: 'Trane',
    model: 'CGAM-500',
  },
  {
    id: 'AST-003',
    name: 'FCU-101 Khu văn phòng',
    type: 'FCU',
    location: 'Tòa nhà A - Tầng 10',
    status: 'online',
    specifications: {
      'Công suất': '5 kW',
      'Lưu lượng khí': '800 CFM',
      'Công suất tiêu thụ': '0.5 kW',
    },
    lastMaintenance: '2026-01-01',
    nextMaintenance: '2026-03-01',
    installDate: '2021-01-10',
    manufacturer: 'Daikin',
    model: 'FWF-05',
  },
  {
    id: 'AST-004',
    name: 'Bơm CW-01',
    type: 'Pump',
    location: 'Tầng hầm - Phòng bơm',
    status: 'critical',
    specifications: {
      'Lưu lượng': '200 m³/h',
      'Cột áp': '25 m',
      'Công suất': '22 kW',
    },
    lastMaintenance: '2025-12-20',
    nextMaintenance: '2026-01-05',
    installDate: '2018-08-20',
    manufacturer: 'Grundfos',
    model: 'NB-80-200',
  },
  {
    id: 'AST-005',
    name: 'Máy nén-01',
    type: 'Compressor',
    location: 'Tòa nhà phụ trợ',
    status: 'online',
    specifications: {
      'Công suất': '100 CFM',
      'Áp suất': '8 bar',
      'Công suất tiêu thụ': '18.5 kW',
    },
    lastMaintenance: '2026-01-04',
    nextMaintenance: '2026-03-20',
    installDate: '2022-05-15',
    manufacturer: 'Atlas Copco',
    model: 'GA-18',
  },
];

export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO-2026-001',
    title: 'Bảo trì hàng quý - AHU-01',
    assetId: 'AST-001',
    assetName: 'AHU-01 Tòa nhà chính',
    source: 'TBM',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2026-01-06T08:00:00Z',
    dueDate: '2026-01-10T17:00:00Z',
    assignee: 'Nguyen Van A',
    checklist: [
      { id: 'CL-001', title: 'Kiểm tra bộ lọc gió', completed: true },
      { id: 'CL-002', title: 'Vệ sinh dàn trao đổi nhiệt', completed: true },
      { id: 'CL-003', title: 'Kiểm tra motor quạt', completed: false },
      { id: 'CL-004', title: 'Đo dòng điện vận hành', completed: false },
      { id: 'CL-005', title: 'Kiểm tra van điều khiển', completed: false },
    ],
  },
  {
    id: 'WO-2026-002',
    title: 'Cảnh báo CBM: Nhiệt độ cao - Chiller-01',
    assetId: 'AST-002',
    assetName: 'Chiller-01 Trung tâm',
    source: 'CBM',
    status: 'open',
    priority: 'high',
    createdAt: '2026-01-05T14:30:00Z',
    dueDate: '2026-01-06T17:00:00Z',
    triggerInfo: {
      metric: 'temperature',
      value: 45.5,
      threshold: 40,
      chartLink: '/telemetry?asset=AST-002&metric=temperature',
    },
    checklist: [
      { id: 'CL-006', title: 'Kiểm tra mức gas lạnh', completed: false },
      { id: 'CL-007', title: 'Kiểm tra bơm nước giải nhiệt', completed: false },
      { id: 'CL-008', title: 'Vệ sinh condenser', completed: false },
    ],
  },
  {
    id: 'WO-2026-003',
    title: 'Sửa chữa khẩn cấp - Bơm CW-01',
    assetId: 'AST-004',
    assetName: 'Bơm CW-01',
    source: 'Manual',
    status: 'overdue',
    priority: 'critical',
    createdAt: '2026-01-04T09:00:00Z',
    dueDate: '2026-01-04T12:00:00Z',
    assignee: 'Tran Van B',
    checklist: [
      { id: 'CL-009', title: 'Kiểm tra rò rỉ seal', completed: true },
      { id: 'CL-010', title: 'Thay thế mechanical seal', completed: false },
      { id: 'CL-011', title: 'Cân chỉnh trục bơm', completed: false },
    ],
    notes: 'Phát hiện rung động bất thường, cần thay seal khẩn cấp',
  },
  {
    id: 'WO-2026-004',
    title: 'Kiểm tra hàng tháng - FCU-101',
    assetId: 'AST-003',
    assetName: 'FCU-101 Khu văn phòng',
    source: 'TBM',
    status: 'done',
    priority: 'low',
    createdAt: '2026-01-01T08:00:00Z',
    dueDate: '2026-01-03T17:00:00Z',
    completedAt: '2026-01-02T15:30:00Z',
    assignee: 'Le Thi C',
    checklist: [
      { id: 'CL-012', title: 'Vệ sinh bộ lọc', completed: true },
      { id: 'CL-013', title: 'Kiểm tra thermostat', completed: true },
      { id: 'CL-014', title: 'Test chế độ vận hành', completed: true },
    ],
  },
  {
    id: 'WO-2026-005',
    title: 'Cảnh báo CBM: Dòng điện cao - Máy nén-01',
    assetId: 'AST-005',
    assetName: 'Máy nén-01',
    source: 'CBM',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-01-07T10:00:00Z',
    dueDate: '2026-01-08T17:00:00Z',
    triggerInfo: {
      metric: 'current',
      value: 42,
      threshold: 38,
      chartLink: '/telemetry?asset=AST-005&metric=current',
    },
    checklist: [
      { id: 'CL-015', title: 'Kiểm tra bộ lọc khí nạp', completed: false },
      { id: 'CL-016', title: 'Kiểm tra áp suất đầu ra', completed: false },
      { id: 'CL-017', title: 'Kiểm tra dầu bôi trơn', completed: false },
    ],
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    assetId: 'AST-002',
    assetName: 'Chiller-01 Trung tâm',
    metric: 'temperature',
    value: 45.5,
    threshold: 40,
    severity: 'high',
    timestamp: '2026-01-05T14:30:00Z',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    assetId: 'AST-004',
    assetName: 'Bơm CW-01',
    metric: 'vibration',
    value: 8.5,
    threshold: 5,
    severity: 'critical',
    timestamp: '2026-01-06T10:15:00Z',
    acknowledged: true,
  },
  {
    id: 'ALT-003',
    assetId: 'AST-005',
    assetName: 'Máy nén-01',
    metric: 'current',
    value: 42,
    threshold: 38,
    severity: 'medium',
    timestamp: '2026-01-07T10:00:00Z',
    acknowledged: false,
  },
  {
    id: 'ALT-004',
    assetId: 'AST-001',
    assetName: 'AHU-01 Tòa nhà chính',
    metric: 'pressure',
    value: 2.8,
    threshold: 3,
    severity: 'low',
    timestamp: '2026-01-03T16:45:00Z',
    acknowledged: true,
    resolvedAt: '2026-01-03T18:00:00Z',
  },
];

export const mockTBMPolicies: TBMPolicy[] = [
  {
    id: 'TBM-001',
    assetId: 'AST-001',
    intervalDays: 90,
    nextDueDate: '2026-03-15',
    lastExecuted: '2026-01-02',
    isActive: true,
    checklistTemplate: [
      'Kiểm tra bộ lọc gió',
      'Vệ sinh dàn trao đổi nhiệt',
      'Kiểm tra motor quạt',
      'Đo dòng điện vận hành',
      'Kiểm tra van điều khiển',
    ],
  },
  {
    id: 'TBM-002',
    assetId: 'AST-002',
    intervalDays: 90,
    nextDueDate: '2026-02-20',
    lastExecuted: '2026-01-01',
    isActive: true,
    checklistTemplate: [
      'Kiểm tra mức gas lạnh',
      'Vệ sinh condenser',
      'Kiểm tra bơm tuần hoàn',
      'Đo áp suất hệ thống',
    ],
  },
  {
    id: 'TBM-003',
    assetId: 'AST-003',
    intervalDays: 30,
    nextDueDate: '2026-02-01',
    lastExecuted: '2026-01-01',
    isActive: true,
    checklistTemplate: [
      'Vệ sinh bộ lọc',
      'Kiểm tra thermostat',
      'Test chế độ vận hành',
    ],
  },
];

export const mockCBMPolicies: CBMPolicy[] = [
  {
    id: 'CBM-001',
    assetId: 'AST-002',
    metric: 'temperature',
    threshold: 40,
    operator: 'gt',
    durationMinutes: 60,
    priority: 1,
    isActive: true,
    overrideTBM: true,
  },
  {
    id: 'CBM-002',
    assetId: 'AST-004',
    metric: 'vibration',
    threshold: 5,
    operator: 'gt',
    durationMinutes: 30,
    priority: 1,
    isActive: true,
    overrideTBM: true,
  },
  {
    id: 'CBM-003',
    assetId: 'AST-005',
    metric: 'current',
    threshold: 38,
    operator: 'gt',
    durationMinutes: 120,
    priority: 2,
    isActive: true,
    overrideTBM: false,
  },
];

// Generate telemetry data for charts
export const generateTelemetryData = (
  assetId: string,
  metric: string,
  hours: number = 24
): TelemetryReading[] => {
  const data: TelemetryReading[] = [];
  const now = new Date();
  const baseValues: Record<string, { base: number; variance: number; unit: string }> = {
    temperature: { base: 35, variance: 15, unit: '°C' },
    current: { base: 30, variance: 15, unit: 'A' },
    pressure: { base: 5, variance: 2, unit: 'bar' },
    vibration: { base: 2, variance: 4, unit: 'mm/s' },
    humidity: { base: 60, variance: 20, unit: '%' },
  };

  const config = baseValues[metric] || { base: 50, variance: 20, unit: '' };

  for (let i = hours * 4; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
    const value = config.base + (Math.random() - 0.3) * config.variance;
    
    data.push({
      timestamp: timestamp.toISOString(),
      assetId,
      metric: metric as any,
      value: Math.round(value * 10) / 10,
      unit: config.unit,
    });
  }

  return data;
};

export const mockDashboardStats: DashboardStats = {
  totalWO: 48,
  openWO: 12,
  inProgressWO: 8,
  doneWO: 25,
  overdueWO: 3,
  tbmCount: 28,
  cbmCount: 15,
  manualCount: 5,
  criticalAlerts: 2,
};

export interface CalendarEvent {
  date: string;
  title: string;
  type: 'TBM' | 'CBM';
  assetId?: string;
  assetName?: string;
}

export const calendarEvents: CalendarEvent[] = [
  { date: '2026-01-08', title: 'AHU-01 Bảo trì hàng quý', type: 'TBM', assetId: 'AST-001', assetName: 'AHU-01 Tòa nhà chính' },
  { date: '2026-01-10', title: 'AHU-01 Bảo trì hàng quý', type: 'TBM', assetId: 'AST-001', assetName: 'AHU-01 Tòa nhà chính' },
  { date: '2026-01-15', title: 'Kiểm tra Chiller-01', type: 'TBM', assetId: 'AST-002', assetName: 'Chiller-01 Trung tâm' },
  { date: '2026-01-20', title: 'FCU Khu A', type: 'TBM', assetId: 'AST-003', assetName: 'FCU-101 Khu văn phòng' },
  { date: '2026-01-25', title: 'Hệ thống bơm', type: 'TBM', assetId: 'AST-004', assetName: 'Bơm CW-01' },
  { date: '2026-02-01', title: 'FCU-101 Kiểm tra hàng tháng', type: 'TBM', assetId: 'AST-003', assetName: 'FCU-101 Khu văn phòng' },
  { date: '2026-02-20', title: 'Chiller-01 Bảo trì hàng quý', type: 'TBM', assetId: 'AST-002', assetName: 'Chiller-01 Trung tâm' },
];
