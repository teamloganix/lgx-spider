import { Button } from "@islands/components/ui/button";
import { Menu } from "lucide-react";
import SidebarLogo from "@islands/components/sidebar/SidebarLogo";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header
      className="lg:hidden fixed left-0 right-0 h-16 bg-white 
    border-b border-violet-100 z-40 flex items-center px-4"
      style={{ top: "var(--banner-height, 0px)" }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenSidebar}
        className="mr-3"
      >
        <Menu className="h-6 w-6 text-slate-700" />
      </Button>

      <div className="flex items-center gap-2">
        <SidebarLogo className="mb-0" />
      </div>
    </header>
  );
}
