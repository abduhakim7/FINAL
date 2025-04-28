import {
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconCommand,
  IconLayoutDashboard,
  IconLoader2,
  IconShoppingBag,
  IconDotsVertical,
  IconPlus,
  IconTrash,
  IconUsers,
  IconChartBar,
  IconDatabase,
  IconX,
  IconChevronsDown,
  IconLogout,
  IconPhotoUp,
  IconRepeat,
  IconCopy,
  IconFilter,
  IconBrandGithub,
  IconProps
} from '@tabler/icons-react';

export type Icon = React.ComponentType<IconProps>;

export const Icons = {
  dashboard: IconLayoutDashboard,
  logo: IconCommand,
  close: IconX,
  product: IconShoppingBag,
  spinner: IconLoader2,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  trash: IconTrash,
  ellipsis: IconDotsVertical,
  add: IconPlus,
  warning: IconAlertTriangle,
  users: IconUsers,
  analytics: IconChartBar,
  database: IconDatabase,
  redo2: IconRepeat,
  copy: IconCopy,
  filter: IconFilter,
  github: IconBrandGithub
} as const;
