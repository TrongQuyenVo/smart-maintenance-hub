import { Bell, Search, User, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockAlerts } from '@/data/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

export function Header() {
  const unacknowledgedAlerts = mockAlerts.filter(a => !a.acknowledged).length;
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Spacer for mobile menu button */}
        <div className="w-10 lg:hidden" />

        {/* Search */}
        <div className="relative hidden sm:block w-full max-w-xs lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thiết bị, lệnh công việc..."
            className="pl-10 bg-muted/50 border-muted focus:bg-background"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Search Button */}
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Search className="w-5 h-5" />
          </Button>

          {/* Theme Toggle */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </motion.div>
            </Button>
          </motion.div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unacknowledgedAlerts > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-destructive text-destructive-foreground"
              >
                {unacknowledgedAlerts}
              </motion.span>
            )}
          </Button>

          {/* User */}
          <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-border">
            <div className="text-right hidden md:block">
              <span className="text-sm font-medium">Admin</span>
              <p className="text-xs text-muted-foreground">Quản lý bảo trì</p>
            </div>
            <div className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary/20">
              <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
