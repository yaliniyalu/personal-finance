export interface NavigationItem {
  label: string;
  icon?: string;
  to?: string;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}
