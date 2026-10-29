import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import type { UserSortField } from '@/api/users.api';
import { Pagination } from '@/components/common/Pagination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UsersTable } from '@/features/users/components/UsersTable';
import { useDeleteUser, useUsers } from '@/features/users/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/stores/auth.store';
import type { SortOrder } from '@/types/api';
import type { User } from '@/types/user';
import { getErrorMessage } from '@/utils/error';

const PAGE_SIZE = 10;

export function UsersPage() {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<UserSortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const debouncedSearch = useDebounce(search.trim());

  const { data, isLoading, isFetching, isError, error } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });
  const deleteUser = useDeleteUser();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (field: UserSortField) => {
    if (field === sortBy) {
      setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Xóa người dùng ${user.email}?`)) {
      deleteUser.mutate(user.id);
    }
  };

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Người dùng</CardTitle>
          <CardDescription>Quản lý tài khoản trong hệ thống</CardDescription>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="pl-9"
            aria-label="Tìm kiếm người dùng"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {deleteUser.isError && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {getErrorMessage(deleteUser.error)}
          </p>
        )}

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
            <UsersTable
              users={data?.items ?? []}
              currentUserId={currentUserId}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onDelete={handleDelete}
              deletingId={deleteUser.isPending ? deleteUser.variables : undefined}
            />
          </div>
        )}

        {data && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            total={data.meta.total}
            disabled={isFetching}
            onPageChange={setPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
