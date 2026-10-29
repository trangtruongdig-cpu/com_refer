import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, disabled, onPageChange }: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Phân trang">
      <p className="text-sm text-muted-foreground">
        Trang {page} / {totalPages}
        {total !== undefined && ` · ${total} bản ghi`}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || !canPrev}
          aria-label="Trang trước"
        >
          <ChevronLeft />
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !canNext}
          aria-label="Trang sau"
        >
          Sau
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
