import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "../MobileHeader";

type SidebarWrapperProps = {
  user?: Record<string, unknown>;
  children: ReactNode;
};

export default function SidebarWrapper({
  children,
  user,
}: SidebarWrapperProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "cart" | "metrics" | "email"
  >("dashboard");

  const handleOpenMobileSidebar = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  useEffect(() => {
    const evaluateCollapse = () => {
      setIsSidebarCollapsed(window.innerWidth < 1024);
    };

    evaluateCollapse();
    window.addEventListener("resize", evaluateCollapse);
    return () => window.removeEventListener("resize", evaluateCollapse);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("cart")) {
      setCurrentPage("cart");
    } else if (path.includes("metrics")) {
      setCurrentPage("metrics");
    } else if (path.includes("email")) {
      setCurrentPage("email");
    } else if (path.includes("dashboard")) {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("dashboard");
    }
  }, []);

  return (
    <div className="flex h-dvh">
      <MobileHeader onOpenSidebar={handleOpenMobileSidebar} />
      <Sidebar
        currentPage={currentPage}
        cartItemCount={0}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        userName={typeof user?.name_f === "string" ? (user.name_f as string) : ""}
        userEmail={typeof user?.email === "string" ? (user.email as string) : ""}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={handleCloseMobileSidebar}
      />
      <div
        className={`transition-all duration-300 grow h-dvh w-full overflow-y-auto ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} lg:pt-0 pt-16`}
      >
        {children}
      </div>
    </div>
  );
}
