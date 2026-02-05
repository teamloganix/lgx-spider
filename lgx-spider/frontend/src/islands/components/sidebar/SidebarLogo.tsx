import LoganixLogo from "@assets/loganix_logo.svg";
import LoganixX from "@assets/loganix_logo_min.svg";

export default function SidebarLogo({
  isCollapsed,
  className = "mb-8",
}: {
  isCollapsed?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 justify-center ${className}`}>
      <a href="/dashboard" className="cursor-pointer">
        {!isCollapsed ? (
          <img
            src={LoganixLogo.src}
            alt="Loganix Logo"
            className="h-[42px] w-auto"
          />
        ) : (
          <img src={LoganixX.src} alt="Loganix X" className="h-6" />
        )}
      </a>
    </div>
  );
}
