import { IconShield, IconUserShield } from '@tabler/icons-react';
import { Building2Icon, BuildingIcon } from 'lucide-react';

export const userRoleTypes = [
  {
    label: 'Administrator',
    value: 'ADMIN',
    icon: IconShield,
  },
  {
    label: 'User',
    value: 'USER',
    icon: IconUserShield,
  },
  {
    label: 'Organization Manager',
    value: 'ORG_ADMIN',
    icon: BuildingIcon,
  },
  {
    label: 'Organization Member',
    value: 'ORG_MEMBER',
    icon: Building2Icon,
  },
] as const;
