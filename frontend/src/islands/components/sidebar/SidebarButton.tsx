import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@islands/components/ui/button";

export default function SidebarButton({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="absolute -right-3 top-8 h-6 w-6 p-0 rounded-full
        border border-violet-200 bg-white shadow-sm hover:bg-violet-50 z-50"
      onClick={onToggleCollapse}
    >
      {isCollapsed ? (
        <ChevronRight className="h-3 w-3 text-violet-600" />
      ) : (
        <ChevronLeft className="h-3 w-3 text-violet-600" />
      )}
    </Button>
  );
}
