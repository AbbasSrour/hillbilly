import { InsightCard } from '@hillbilly/ui/components/cards/insight-card';
import { useSearch } from '@hillbilly/ui/hooks/search';
import { IconUser } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { userQueries } from '@/app/users/hooks/api/users.queries.ts';

interface NewUsersInsightProps {
  gradientClassName?: string;
  iconClassName?: string;
}

export const NewUsersInsight = ({ gradientClassName, iconClassName }: NewUsersInsightProps) => {
  const { searchValue } = useSearch();

  const { data } = useQuery(
    userQueries.insights.newUsers({
      search: searchValue,
    }),
  );

  const newUsers = data?.meta.itemCount ?? 0;

  return (
    <InsightCard
      title="New Users (30d)"
      value={`+${newUsers}`}
      subtext="Growth"
      icon={IconUser}
      gradientClassName={gradientClassName ?? 'from-emerald-500/20 to-teal-500/20'}
      iconClassName={iconClassName ?? 'text-emerald-500'}
    />
  );
};
