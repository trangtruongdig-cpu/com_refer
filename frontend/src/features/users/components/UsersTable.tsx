import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from 'lucide-react';
import type { UserSortField } from '@/api/users.api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SortOrder } from '@/types/api';
import type { User } from '@/types/user';
import { formatDateTime } from '@/utils/format';

interface UsersTableProps {
  users: User[];
  currentUserId?: string;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  onSortChange: (field: UserSortField) => void;
  onDelete: (user: User) => void;
  deletingId?: string;
}

function SortIcon({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
  return order === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}

const COLUMNS: { field: UserSortField; label: string }[] = [
  { field: 'name', label: 'Họ tên' },
  { field: 'email', label: 'Email' },
];

export function UsersTable({
  users,
  currentUserId,
  sortBy,
  sortOrder,
  onSortChange,
  onDelete,
  deletingId,
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map(({ field, label }) => (
            <TableHead key={field}>
              <button
                type="button"
                className="inline-flex items-center gap-1 hover:text-foreground"
                onClick={() => onSortChange(field)}
              >
                {label}
                <SortIcon active={sortBy === field} order={sortOrder} />
              </button>
            </TableHead>
          ))}
          <TableHead>Vai trò</TableHead>
          <TableHead>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-foreground"
              onClick={() => onSortChange('createdAt')}
            >
              Ngày tạo
              <SortIcon active={sortBy === 'createdAt'} order={sortOrder} />
            </button>
          </TableHead>
          <TableHead className="w-16 text-right">
            <span className="sr-only">Thao tác</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              Không có người dùng nào
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
              </TableCell>
              <TableCell>{formatDateTime(user.createdAt)}</TableCell>
              <TableCell className="text-right">
                {user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Xóa ${user.email}`}
                    disabled={deletingId === user.id}
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
