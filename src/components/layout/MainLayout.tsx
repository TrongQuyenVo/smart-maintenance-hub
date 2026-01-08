import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <>
      <Sidebar />
      <div className={cn(collapsed ? 'lg:pl-16' : 'lg:pl-64', 'transition-all duration-300')}>
        <Header />
        <main className="p-4 sm:p-6 lg:pt-6">
          {children}
        </main>
      </div>
    </>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <LayoutContent>{children}</LayoutContent>
      </div>
    </SidebarProvider>
  );
}
