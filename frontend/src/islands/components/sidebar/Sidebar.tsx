/* eslint-disable max-len */
import { TooltipProvider } from '@islands/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@islands/components/ui/sheet';
import SidebarLogo from './SidebarLogo';
import SidebarNavigation from './SidebarNavigation';
import SidebarUserProfile from './SidebarUserProfile';
import SidebarButton from './SidebarButton';

interface SidebarProps {
  currentPage: 'dashboard' | 'cart' | 'metrics' | 'email';
  cartItemCount?: number;
  userName?: string;
  userEmail?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  currentPage,
  cartItemCount = 0,
  userName = '',
  userEmail = '',
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-h-0">
        <SidebarLogo isCollapsed={isMobile ? false : isCollapsed} />

        <div className="flex-1">
          <SidebarNavigation
            currentPage={currentPage}
            isCollapsed={isMobile ? false : isCollapsed}
            cartItemCount={cartItemCount}
          />
        </div>
      </div>

      <div className="p-6 border-t border-violet-100 pt-4 space-y-2 flex-shrink-0">
        <SidebarUserProfile
          isCollapsed={isMobile ? false : isCollapsed}
          userName={userName || ''}
          userEmail={userEmail || ''}
        />
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {/* Mobile Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="p-0 w-64 lg:hidden">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate through different pages of Loganix Spider platform
          </SheetDescription>
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:fixed lg:flex left-0 bg-white border-r border-violet-100 flex-col z-40 transition-[width] duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{
          top: 'var(--banner-height, 0px)',
          height: 'calc(100vh - var(--banner-height, 0px))',
        }}
      >
        {/* Collapse Button */}
        <SidebarButton isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />

        <SidebarContent isMobile={false} />
      </div>
    </TooltipProvider>
  );
}
