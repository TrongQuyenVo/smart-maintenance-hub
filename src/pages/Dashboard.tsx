import { useState } from 'react';
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { KPICard } from '@/components/dashboard/KPICard';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { WOSourceChart } from '@/components/dashboard/WOSourceChart';
import { RecentWorkOrdersTable } from '@/components/dashboard/RecentWorkOrdersTable';
import { ExportMaintenancePlan } from '@/components/dashboard/ExportMaintenancePlan';
import { mockDashboardStats, mockWorkOrders, mockAlerts } from '@/data/mockData';

export default function Dashboard() {
  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xl sm:text-2xl font-bold">Bảng điều khiển bảo trì</span>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tổng quan hoạt động bảo trì và tình trạng hệ thống
          </p>
        </div>
        <ExportMaintenancePlan />
      </div>

      {/* KPI Cards */}
      {/* derive KPI numbers from mock data (keeps dashboard in sync with state) */}
      {(() => {
        const openWO = mockWorkOrders.filter(wo => wo.status === 'open').length;
        const inProgressWO = mockWorkOrders.filter(wo => wo.status === 'in_progress').length;
        const overdueWO = mockWorkOrders.filter(wo => wo.status === 'overdue').length;
        const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && !a.resolvedAt).length;

        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <KPICard
                title="Đang mở"
                value={openWO}
                subtitle="Chờ phân công"
                icon={<AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                variant="default"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <KPICard
                title="Đang xử lý"
                value={inProgressWO}
                subtitle="Đang thực hiện"
                icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
                variant="warning"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <KPICard
                title="Quá hạn"
                value={overdueWO}
                subtitle="Cần chú ý"
                icon={<AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
                variant="danger"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <KPICard
                title="Cảnh báo CBM"
                value={criticalAlerts}
                subtitle="Cảnh báo hoạt động"
                icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
                variant="success"
              />
            </motion.div>
          </div>
        );
      })()}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CalendarView />
        <RecentWorkOrdersTable />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <WOSourceChart />

        {/* System Health Overview */}
        <motion.div
          className="lg:col-span-2 glass-card rounded-xl p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Tổng quan tình trạng hệ thống
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
              <span className="text-xs sm:text-sm">Thiết bị hoạt động</span>
              <span className="font-mono text-xs sm:text-sm text-success">3/5 (60%)</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
              <span className="text-xs sm:text-sm">Luồng dữ liệu</span>
              <span className="font-mono text-xs sm:text-sm text-success">Hoạt động</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
              <span className="text-xs sm:text-sm">Chính sách TBM</span>
              <span className="font-mono text-xs sm:text-sm text-info">3</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30">
              <span className="text-xs sm:text-sm">Quy tắc CBM</span>
              <span className="font-mono text-xs sm:text-sm text-primary">3</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-destructive/10">
              <span className="text-xs sm:text-sm">Cảnh báo nghiêm trọng</span>
              <span className="font-mono text-xs sm:text-sm text-destructive">{mockDashboardStats.criticalAlerts}</span>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-success/10">
              <span className="text-xs sm:text-sm">Hoàn thành tháng này</span>
              <span className="font-mono text-xs sm:text-sm text-success">{mockDashboardStats.doneWO}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
