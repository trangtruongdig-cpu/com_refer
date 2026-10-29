#!/usr/bin/env bash
# Chuẩn bị VPS Ubuntu 22.04/24.04 mới — CHẠY MỘT LẦN bằng root:
#   scp scripts/setup-vps.sh root@<IP>:/root/ && ssh root@<IP> "bash /root/setup-vps.sh deploy"
#
# Việc script làm:
#   - Tạo user deploy (không dùng root), copy SSH key của root sang
#   - Cài Docker Engine + Compose plugin
#   - Bật UFW (chỉ mở 22, 80, 443), cài fail2ban
#   - Tạo swap 2GB
#   - Tắt đăng nhập SSH bằng mật khẩu và đăng nhập root
#   - Tạo thư mục ứng dụng APP_DIR (GitHub Actions sẽ copy file deploy vào đây)
set -euo pipefail

DEPLOY_USER="${1:-deploy}"
APP_DIR="${APP_DIR:-/opt/app}"
SSH_PORT="${SSH_PORT:-22}"
SWAP_SIZE="${SWAP_SIZE:-2G}"

log() { echo -e "\033[1;34m[setup]\033[0m $*"; }
warn() { echo -e "\033[1;33m[setup] $*\033[0m"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "Script cần chạy bằng root" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

log "Cập nhật hệ thống..."
apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg ufw fail2ban unattended-upgrades

# ---------- Docker ----------
if ! command -v docker > /dev/null 2>&1; then
  log "Cài Docker Engine + Compose plugin..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck disable=SC1091
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
else
  log "Docker đã được cài, bỏ qua"
fi

# ---------- User deploy ----------
if ! id "$DEPLOY_USER" > /dev/null 2>&1; then
  log "Tạo user $DEPLOY_USER..."
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG docker,sudo "$DEPLOY_USER"

DEPLOY_HOME="/home/${DEPLOY_USER}"
mkdir -p "${DEPLOY_HOME}/.ssh"
if [ -f /root/.ssh/authorized_keys ] && [ ! -s "${DEPLOY_HOME}/.ssh/authorized_keys" ]; then
  log "Copy SSH key của root sang ${DEPLOY_USER}"
  cp /root/.ssh/authorized_keys "${DEPLOY_HOME}/.ssh/authorized_keys"
fi
touch "${DEPLOY_HOME}/.ssh/authorized_keys"
chmod 700 "${DEPLOY_HOME}/.ssh"
chmod 600 "${DEPLOY_HOME}/.ssh/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_HOME}/.ssh"

# ---------- Thư mục ứng dụng ----------
log "Tạo thư mục ứng dụng ${APP_DIR}"
mkdir -p "${APP_DIR}/backups" "${APP_DIR}/caddy/sites" "${APP_DIR}/scripts"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$APP_DIR"

# ---------- Firewall ----------
log "Cấu hình UFW (mở ${SSH_PORT}, 80, 443)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow "${SSH_PORT}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

# ---------- fail2ban ----------
log "Cấu hình fail2ban cho SSH..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ${SSH_PORT}
backend = systemd
EOF
systemctl enable fail2ban
systemctl restart fail2ban

# ---------- Swap ----------
if ! swapon --show | grep -q '/swapfile'; then
  log "Tạo swap ${SWAP_SIZE}..."
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-swappiness.conf
  sysctl -p /etc/sysctl.d/99-swappiness.conf
else
  log "Swap đã tồn tại, bỏ qua"
fi

# ---------- Tự động cập nhật bảo mật ----------
dpkg-reconfigure -f noninteractive unattended-upgrades

# ---------- SSH hardening ----------
# Chỉ tắt mật khẩu khi user deploy ĐÃ có SSH key, tránh tự khóa mình ngoài VPS
if [ -s "${DEPLOY_HOME}/.ssh/authorized_keys" ]; then
  log "Tắt đăng nhập SSH bằng mật khẩu và đăng nhập root..."
  # Tên 00-* để được đọc TRƯỚC 50-cloud-init.conf (sshd lấy giá trị xuất hiện đầu tiên)
  cat > /etc/ssh/sshd_config.d/00-hardening.conf <<EOF
Port ${SSH_PORT}
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
EOF
  sshd -t
  systemctl restart ssh 2> /dev/null || systemctl restart sshd
else
  warn "User ${DEPLOY_USER} chưa có SSH key => CHƯA tắt đăng nhập bằng mật khẩu."
  warn "Thêm public key vào ${DEPLOY_HOME}/.ssh/authorized_keys rồi chạy lại script."
fi

log "Hoàn tất!"
cat <<EOF

Bước tiếp theo:
  1. Thử đăng nhập bằng user mới (mở terminal khác, ĐỪNG đóng phiên root này):
       ssh ${DEPLOY_USER}@<IP_VPS> -p ${SSH_PORT}
  2. Đặt mật khẩu sudo cho ${DEPLOY_USER}:  passwd ${DEPLOY_USER}
  3. Tạo file ${APP_DIR}/.env từ .env.production.example (chmod 600)
  4. Khai báo GitHub secrets rồi push lên nhánh main

Lưu ý: Docker bỏ qua UFW với các port được publish. Chỉ service caddy được publish 80/443.
EOF
