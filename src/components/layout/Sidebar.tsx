import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  Settings, 
  ClipboardList, 
  Activity, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { path: '/', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { path: '/assets', label: 'Thiết bị', icon: Server },
  { path: '/work-orders', label: 'Lệnh công việc', icon: ClipboardList },
  { path: '/policies', label: 'Chính sách', icon: Settings },
  { path: '/telemetry', label: 'Dữ liệu cảm biến', icon: Activity },
  { path: '/alerts', label: 'Cảnh báo', icon: Bell },
];

function NavContent({ collapsed, onItemClick }: { collapsed: boolean; onItemClick?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={cn(
              'nav-link',
              isActive && 'active',
              collapsed && 'justify-center px-3'
            )}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

// Mobile Sidebar using Sheet
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden fixed left-4 top-4 z-50">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">Smart MMS</span>
            <span className="text-xs text-muted-foreground">IoT Tích hợp</span>
          </div>
        </div>
        
        <NavContent collapsed={false} onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">Smart MMS</span>
              <span className="text-xs text-muted-foreground">IoT Tích hợp</span>
            </div>
          )}
        </div>

        <NavContent collapsed={collapsed} />

        {/* Collapse Button */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm',
              'text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Thu gọn</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
