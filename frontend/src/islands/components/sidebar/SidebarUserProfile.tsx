import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemComponent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@islands/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@islands/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@islands/components/ui/avatar';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@islands/components/ui/button';
import { performLogout } from '@utils/auth-cookies';
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
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getUserInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    await performLogout();
  };

  return (
    <>
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
                <ChevronRight className="h-4 w-4 shrink-0" />
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
                <DropdownMenuItemComponent
                  key={item.id}
                  className={`${item.className ?? ''} focus:bg-red-50 focus:text-red-700`}
                  onSelect={e => {
                    e.preventDefault();
                    // Open modal after dropdown closes to avoid focus/portal conflict
                    setTimeout(() => setLogoutModalOpen(true), 0);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
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

      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You will need to log in again to access the app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleLogoutConfirm().catch(() => {})}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out…
                </>
              ) : (
                'Sign out'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
