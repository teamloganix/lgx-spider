import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemComponent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@islands/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@islands/components/ui/avatar';
import { ChevronRight } from 'lucide-react';
import { Button } from '@islands/components/ui/button';
import { userProfileMenuItems } from '../data/navigation-config';

export default function SidebarUserProfile({
  isCollapsed,
  userName,
  userEmail,
}: {
  isCollapsed: boolean;
  userName: string;
  userEmail: string;
}) {
  const getUserInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start text-slate-600
            hover:bg-violet-50 hover:text-violet-700 h-auto ${isCollapsed ? 'p-2' : 'p-3'}`}
        >
          {isCollapsed ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={userName} />
              <AvatarFallback className="bg-violet-600 text-white text-xs">
                {getUserInitials(userName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <>
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-violet-600 text-white text-xs">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right" align="end">
        {userProfileMenuItems.map(item => {
          if (item.separator) {
            return <DropdownMenuSeparator key={item.id} />;
          }

          const Icon = item.icon;

          if (item.onClick === 'logout') {
            return (
              <DropdownMenuItemComponent key={item.id} asChild>
                <a href="/logout" className={item.className}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </a>
              </DropdownMenuItemComponent>
            );
          }

          return (
            <DropdownMenuItemComponent key={item.id} asChild>
              <a
                href={
                  item.path
                    ? (() => {
                        const baseUrl = import.meta.env.BASE_URL || '/';
                        const normalizedPath = item.path!.startsWith('/')
                          ? item.path!
                          : `/${item.path!}`;
                        return baseUrl === '/'
                          ? normalizedPath
                          : `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
                      })()
                    : item.href || '#'
                }
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </a>
            </DropdownMenuItemComponent>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
