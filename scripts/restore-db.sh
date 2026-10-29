#!/bin/sh
# Khôi phục database từ một file backup (.sql.gz) — GHI ĐÈ dữ liệu hiện tại!
# Nên dùng `make restore FILE=...` (tự dừng/bật lại backend). Chạy tay:
#   docker compose -f docker-compose.prod.yml exec db-backup /bin/sh /scripts/restore-db.sh <file.sql.gz>
# Bỏ qua bước xác nhận: thêm biến FORCE=1
set -eu
set -o pipefail

if [ -f /etc/backup.env ]; then
  # shellcheck disable=SC1091
  . /etc/backup.env
fi

BACKUP_DIR="${BACKUP_DIR:-/backups}"
FILE="${1:-}"

if [ -z "$FILE" ]; then
  echo "Cách dùng: restore-db.sh <file.sql.gz>"
  echo "Các bản backup hiện có:"
  ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "  (không có)"
  exit 1
fi

# Cho phép truyền tên file ngắn gọn (không kèm thư mục)
if [ ! -f "$FILE" ] && [ -f "${BACKUP_DIR}/${FILE}" ]; then
  FILE="${BACKUP_DIR}/${FILE}"
fi

if [ ! -f "$FILE" ]; then
  echo "Không tìm thấy file: $FILE" >&2
  exit 1
fi

: "${PGDATABASE:?Thiếu PGDATABASE}"

echo "⚠️  Sẽ GHI ĐÈ database '${PGDATABASE}' bằng file: ${FILE}"
if [ "${FORCE:-0}" != "1" ]; then
  printf "Gõ 'yes' để tiếp tục: "
  read -r answer
  if [ "$answer" != "yes" ]; then
    echo "Đã hủy."
    exit 1
  fi
fi

echo "[$(date '+%F %T')] Đang khôi phục..."
gunzip -c "$FILE" | psql --quiet --single-transaction -v ON_ERROR_STOP=1 > /dev/null
echo "[$(date '+%F %T')] Khôi phục thành công."
