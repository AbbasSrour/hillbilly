import { InsightCard } from '@hillbilly/ui/components/cards/insight-card';
import { useSearch } from '@hillbilly/ui/hooks/search';
import { IconShield } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { userQueries } from '@/app/users/hooks/api/users.queries.ts';

interface AdminsManagersInsightProps {
  gradientClassName?: string;
  iconClassName?: string;
}

export const AdminsManagersInsight = ({
  gradientClassName,
  iconClassName,
}: AdminsManagersInsightProps) => {
  const { searchValue } = useSearch();

  const { data: adminsData } = useQuery(
    userQueries.insights.admins({
      search: searchValue,
    }),
  );

  const { data: managersData } = useQuery(
    userQueries.insights.managers({
      search: searchValue,
    }),
  );

  const admins = adminsData?.meta.itemCount ?? 0;
  const managers = managersData?.meta.itemCount ?? 0;
  const total = admins + managers;

  return (
    <InsightCard
      title="Admins & Managers"
      value={total.toLocaleString()}
      subtext={`${admins} Admins, ${managers} Managers`}
      icon={IconShield}
      gradientClassName={gradientClassName ?? 'from-amber-500/20 to-orange-500/20'}
      iconClassName={iconClassName ?? 'text-amber-500'}
    />
  );
};
