import type { User } from '@hillbilly/sdk';
import { DataTableBadgeCell } from '@hillbilly/ui/components/data-table/cells/data-table-badge-cell';
import { DataTableIconLabelCell } from '@hillbilly/ui/components/data-table/cells/data-table-icon-label-cell';
import { DataTablePhoneCell } from '@hillbilly/ui/components/data-table/cells/data-table-phone-cell';
import { DataTableColumnHeader } from '@hillbilly/ui/components/data-table/data-table-column-header';
import { DataTableRowActions } from '@hillbilly/ui/components/data-table/data-table-row-actions';
import { createRowNumberColumn } from '@hillbilly/ui/components/data-table/utils/row-number-column-helper';
import { Avatar, AvatarFallback, AvatarImage } from '@hillbilly/ui/core/avatar';
import { IconMail, IconTrash, IconUser } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { userRoleTypes } from '@/app/users/constants/user-role-types.ts';
import { userStatusType } from '@/app/users/constants/user-status-type.ts';
import { useDeleteUser, useSendEmailVerification } from '@/app/users/hooks/api/users.queries.ts';
import { userRoleFilter } from '@/app/users/utils/user-role-filter';
import { userStatusFilter } from '@/app/users/utils/user-status-filter';

const columnHelper = createColumnHelper<User>();

export const userDataTableColumns = [
  // --------------------> Row # Column <------------------- //
  createRowNumberColumn<User>(),
  // --------------------> Name Column <-------------------- //
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => <DataTableColumnHeader title={'User'} column={column} />,
    cell: ({ cell }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={cell.row.original.image} alt={cell.getValue()} />
          <AvatarFallback>{cell.getValue().slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{cell.getValue()}</span>
          <span className="text-xs text-muted-foreground">{cell.row.original.email}</span>
        </div>
      </div>
    ),
    enableSorting: true,
  }),
  // --------------------> Phone Column <------------------- //
  columnHelper.accessor('phoneNumber', {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
    cell: ({ cell }) => <DataTablePhoneCell value={cell.getValue()} />,
    enableSorting: true,
    enableHiding: false,
  }),
  // --------------------> Role Column <------------------- //
  columnHelper.accessor('role', {
    id: userRoleFilter.id,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <DataTableIconLabelCell
        value={row.original.role}
        options={userRoleTypes}
        defaultIcon={IconUser}
      />
    ),
    enableSorting: true,
    enableHiding: false,
  }),
  // --------------------> Status Column <------------------- //
  columnHelper.accessor(userStatusFilter.getValue, {
    id: userStatusFilter.id,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ cell }) => <DataTableBadgeCell value={cell.getValue()} options={userStatusType} />,
    enableHiding: true,
    enableSorting: false,
    enableColumnFilter: true,
  }),
  // --------------------> Actions Column <-------------------- //
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const { mutate: deleteUser } = useDeleteUser();
      const { mutate: sendEmailVerification } = useSendEmailVerification();

      return (
        <DataTableRowActions
          row={row}
          actions={[
            [
              {
                label: 'Edit User',
                onClick: () => {
                  void navigate({
                    to: '/admin/users/$userId/edit',
                    params: {
                      userId: row.original.id!,
                    },
                  });
                },
              },
              {
                label: 'Send Verification Email',
                icon: IconMail,
                onClick: () => {
                  sendEmailVerification({ email: row.original.email });
                },
              },
            ],
            [
              {
                label: 'Delete User',
                icon: IconTrash,
                onClick: () => {
                  deleteUser({ userId: row.original.id || '' });
                },
              },
            ],
          ]}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  }),
];
