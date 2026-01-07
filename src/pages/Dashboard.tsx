import { useState } from 'react';
import { 
  ClipboardList, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { KPICard } from '@/components/dashboard/KPICard';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { WOSourceChart } from '@/components/dashboard/WOSourceChart';
import { RecentWorkOrdersTable } from '@/components/dashboard/RecentWorkOrdersTable';
import { mockDashboardStats } from '@/data/mockData';

export default function Dashboard() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Maintenance Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of maintenance operations and system health
        </p>
      </div>

      {/* KPI Cards - SC01: Open WO | Overdue | Alerts (CBM) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <KPICard
            title="Open Work Orders"
            value={mockDashboardStats.openWO}
            subtitle="Pending assignment"
            icon={<AlertCircle className="w-6 h-6" />}
            variant="default"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <KPICard
            title="In Progress"
            value={mockDashboardStats.inProgressWO}
            subtitle="Being worked on"
            icon={<Clock className="w-6 h-6" />}
            variant="warning"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <KPICard
            title="Overdue"
            value={mockDashboardStats.overdueWO}
            subtitle="Needs attention"
            icon={<AlertTriangle className="w-6 h-6" />}
            variant="danger"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <KPICard
            title="CBM Alerts"
            value={mockDashboardStats.criticalAlerts}
            subtitle="Active alerts"
            icon={<Activity className="w-6 h-6" />}
            variant="success"
          />
        </motion.div>
      </div>

      {/* Main Content Grid - SC01: Calendar + Recent WO Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar (TBM) */}
        <CalendarView />

        {/* Recent Work Orders Table */}
        <RecentWorkOrdersTable />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WOSourceChart />
        
        {/* System Health Overview */}
        <motion.div 
          className="lg:col-span-2 glass-card rounded-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            System Health Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">Assets Online</span>
              <span className="font-mono text-success">3/5 (60%)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">Sensor Data Flow</span>
              <span className="font-mono text-success">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">TBM Policies Active</span>
              <span className="font-mono text-info">3</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm">CBM Rules Active</span>
              <span className="font-mono text-primary">3</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
              <span className="text-sm">Critical Alerts</span>
              <span className="font-mono text-destructive">{mockDashboardStats.criticalAlerts}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
              <span className="text-sm">Completed This Month</span>
              <span className="font-mono text-success">{mockDashboardStats.doneWO}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
