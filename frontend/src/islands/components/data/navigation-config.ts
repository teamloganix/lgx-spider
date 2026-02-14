import { type LucideIcon, Target, ShoppingCart, BarChart3, Mail, User, LogOut } from 'lucide-react';

export interface NavigationSubItem {
  id: string;
  label: string;
  href?: string;
  path?: string;
  onClick?: () => void;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  subItems?: NavigationSubItem[];
  collapsible?: boolean;
  path?: string;
}

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  path?: string;
  onClick?: (() => void) | string;
  separator?: boolean;
  className?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'campaigns',
    label: 'Campaigns',
    icon: Target,
    path: '/campaigns',
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: ShoppingCart,
    path: '/cart',
  },
  {
    id: 'metrics',
    label: 'Metrics',
    icon: BarChart3,
    path: '/metrics',
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    path: '/emails',
  },
];

export const userProfileMenuItems: DropdownMenuItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/campaigns',
  },
  {
    id: 'separator-1',
    label: '',
    icon: User,
    separator: true,
  },
  {
    id: 'sign-out',
    label: 'Sign out',
    icon: LogOut,
    onClick: 'logout',
    className: 'text-red-600 cursor-pointer',
  },
];
