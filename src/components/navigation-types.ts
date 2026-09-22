import type { IconName } from './icon-types';

export interface NavigationSubItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  current?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  meta?: string;
  current?: boolean;
  expanded?: boolean;
  children?: NavigationSubItem[];
}

export type NavigationVariant = 'rail' | 'sheet';
