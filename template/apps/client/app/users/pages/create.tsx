import { Main } from '@hillbilly/ui/components/layout/main';
import { PageHeader } from '@hillbilly/ui/components/layout/page-header';
import { createFileRoute } from '@tanstack/react-router';
import { rolesQueries } from '@/app/roles/hooks/api/roles.queries.ts';
import { UserForm } from '@/app/users/components/form/user-form.tsx';
import { CreateUserSkeleton } from '@/app/users/components/loading/create-user-skeleton';

export const Route = createFileRoute('/admin/users/create')({
  pendingComponent: CreateUserSkeleton,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(rolesQueries.list());
  },
  head: () => ({
    meta: [
      {
        title: 'Create User - Class Digital Pins',
      },
      {
        name: 'description',
        content: 'Create a new user account.',
      },
      {
        property: 'og:title',
        content: 'Create User - Class Digital Pins',
      },
      {
        property: 'og:description',
        content: 'Create a new user account.',
      },
    ],
  }),
  component: CreateUserPage,
});

function CreateUserPage() {
  // const s = true;
  const s = false;
  if (s) {
    return <CreateUserSkeleton />;
  }

  return (
    <Main>
      <PageHeader
        title="Create User"
        description="Create a new user account."
        withSeparator
      />
      <UserForm />
    </Main>
  );
}
