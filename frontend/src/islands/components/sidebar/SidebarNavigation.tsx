import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@islands/components/ui/tooltip";
import { Badge } from "@islands/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  navigationItems,
  type NavigationItem,
} from "../data/navigation-config";

export default function SidebarNavigation({
  currentPage,
  isCollapsed,
  cartItemCount = 0,
}: {
  currentPage: "dashboard" | "cart" | "metrics" | "email";
  isCollapsed: boolean;
  cartItemCount?: number;
}) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const isSubItemActive = (item: NavigationItem): boolean => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => subItem.id === currentPage);
  };

  const isSubItemCurrent = (subItemId: string): boolean =>
    subItemId === currentPage;

  const getInitials = (label: string): string => {
    const words = label.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words[0].length >= 2) return words[0].substring(0, 2).toUpperCase();
    return words[0][0].toUpperCase();
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.subItems && item.collapsible) {
      toggleExpanded(item.id);
    } else if (item.path) {
      const baseUrl = import.meta.env.BASE_URL || "/";
      const normalizedPath = item.path.startsWith("/") ? item.path : `/${item.path}`;
      const fullPath =
        baseUrl === "/" ? normalizedPath : `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
      window.location.href = fullPath;
    } else if (item.href) {
      window.location.href = item.href;
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const subItemActive = hasSubItems ? isSubItemActive(item) : false;
    const isActive = currentPage === item.id || subItemActive;
    const isExpanded = expandedItems[item.id] !== undefined ? expandedItems[item.id] : subItemActive;
    const showBadge = item.id === "cart" && cartItemCount > 0;

    return (
      <div key={item.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 shadow-sm"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="relative flex items-center shrink-0">
                <Icon className="h-5 w-5" />
                {isCollapsed && hasSubItems && item.collapsible && (
                  <ChevronDown
                    className={`h-3 w-3 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && <Badge className="ml-auto bg-violet-600">{cartItemCount}</Badge>}
                  {hasSubItems && item.collapsible && (
                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  )}
                </>
              )}
              {isCollapsed && showBadge && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-violet-600 rounded-full" />
              )}
            </button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>{item.label} {showBadge && `(${cartItemCount})`}</p>
            </TooltipContent>
          )}
        </Tooltip>

        {hasSubItems && isExpanded && (
          <div className={`space-y-1 mt-1 ${isCollapsed ? "" : "ml-8"}`}>
            {item.subItems?.map((subItem) => {
              const isSubActive = isSubItemCurrent(subItem.id);
              const initials = getInitials(subItem.label);
              return (
                <Tooltip key={subItem.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (subItem.path) {
                          const baseUrl = import.meta.env.BASE_URL || "/";
                          const np = subItem.path.startsWith("/") ? subItem.path : `/${subItem.path}`;
                          const fullPath = baseUrl === "/" ? np : `${baseUrl.replace(/\/$/, "")}${np}`;
                          window.location.href = fullPath;
                        } else if (subItem.href) {
                          window.location.href = subItem.href;
                        } else if (subItem.onClick) {
                          subItem.onClick();
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg cursor-pointer ${
                        isSubActive
                          ? "bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 shadow-sm"
                          : "text-slate-600 hover:text-violet-700 hover:bg-violet-50"
                      } ${isCollapsed ? "justify-center" : "text-left"}`}
                    >
                      {isCollapsed ? (
                        <span className="h-5 w-5 flex items-center justify-center shrink-0 text-xs font-medium bg-violet-100 text-violet-700 rounded">
                          {initials}
                        </span>
                      ) : (
                        <span>{subItem.label}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{subItem.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-2 flex-1">
      {navigationItems.map((item) => renderNavigationItem(item))}
    </nav>
  );
}
