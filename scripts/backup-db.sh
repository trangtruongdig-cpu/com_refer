#!/bin/sh
# Backup PostgreSQL: pg_dump nén gzip, đặt tên theo ngày, giữ N bản gần nhất.
# Chạy trong container db-backup (cron 2h sáng) hoặc thủ công:
#   docker compose -f docker-compose.prod.yml exec db-backup /bin/sh /scripts/backup-db.sh
set -eu
set -o pipefail

# Cron không kế thừa env của container => nạp lại từ file do entrypoint tạo
if [ -f /etc/backup.env ]; then
  # shellcheck disable=SC1091
  . /etc/backup.env
fi

BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION="${BACKUP_RETENTION:-7}"
: "${PGHOST:?Thiếu PGHOST}"
: "${PGUSER:?Thiếu PGUSER}"
: "${PGPASSWORD:?Thiếu PGPASSWORD}"
: "${PGDATABASE:?Thiếu PGDATABASE}"
export PGHOST PGUSER PGPASSWORD PGDATABASE

TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"
FILE="${BACKUP_DIR}/${PGDATABASE}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
echo "[$(date '+%F %T')] Bắt đầu backup database '${PGDATABASE}' -> ${FILE}"

# Ghi ra file tạm trước, thành công mới đổi tên => không có file backup dở dang
pg_dump --clean --if-exists --no-owner --no-privileges | gzip -9 > "${FILE}.tmp"
mv "${FILE}.tmp" "$FILE"

SIZE="$(du -h "$FILE" | cut -f1)"
echo "[$(date '+%F %T')] Backup xong (${SIZE})"

# Giữ lại RETENTION bản mới nhất
ls -1t "${BACKUP_DIR}/${PGDATABASE}"_*.sql.gz 2>/dev/null \
  | tail -n "+$((RETENTION + 1))" \
  | xargs -r rm -f
echo "[$(date '+%F %T')] Đang giữ $(ls -1 "${BACKUP_DIR}/${PGDATABASE}"_*.sql.gz | wc -l) bản backup"

# (Tùy chọn) đẩy lên S3 / Cloudflare R2 / Backblaze bằng rclone
if [ -n "${RCLONE_REMOTE:-}" ]; then
  if command -v rclone > /dev/null 2>&1; then
    rclone copy "$FILE" "$RCLONE_REMOTE" && echo "[$(date '+%F %T')] Đã upload lên ${RCLONE_REMOTE}"
  else
    echo "[$(date '+%F %T')] CẢNH BÁO: có RCLONE_REMOTE nhưng container không có rclone (xem README)" >&2
  fi
fi
