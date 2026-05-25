import { Main } from '@hillbilly/ui/components/layout/main';
import { PageHeader } from '@hillbilly/ui/components/layout/page-header';
import { Button } from '@hillbilly/ui/core/button';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { rolesQueries } from '@/app/roles/hooks/api/roles.queries.ts';
import { UserForm } from '@/app/users/components/form/user-form.tsx';
import { EditUserSkeleton } from '@/app/users/components/loading/edit-user-skeleton';
import { userQueries } from '@/app/users/hooks/api/users.queries.ts';
import { userToFormValues } from '@/app/users/utils/user-form-transformer.ts';

export const Route = createFileRoute('/admin/users/$userId/edit')({
  pendingComponent: EditUserSkeleton,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      userQueries.single(params.userId),
    );
    await context.queryClient.ensureQueryData(rolesQueries.list());
  },
  head: () => ({
    meta: [
      {
        title: 'Edit User - Class Digital Pins',
      },
      {
        name: 'description',
        content: 'Update a user account.',
      },
      {
        property: 'og:title',
        content: 'Edit User - Class Digital Pins',
      },
      {
        property: 'og:description',
        content: 'Update a user account.',
      },
    ],
  }),
  component: EditUserPage,
});

function EditUserPage() {
  const params = Route.useParams();
  const userId = params.userId;
  const { data: user } = useSuspenseQuery(userQueries.single(userId));

  if (!user) {
    return <div>User not found</div>;
  }

  const defaultValues = userToFormValues(user);

  return (
    <Main>
      <PageHeader
        title={`Edit ${user.name}`}
        description="Update the user details."
        withSeparator
      >
        <Link
          to="/admin/users"
          search={{ search: '', page: 1, pageSize: 10, role: undefined }}
        >
          <Button variant="ghost">Back to Users</Button>
        </Link>
      </PageHeader>
      <UserForm userId={userId} defaultValues={defaultValues} />
    </Main>
  );
}
