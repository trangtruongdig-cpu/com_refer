# Base Project — React + Express + PostgreSQL

Boilerplate **production-ready** gồm Frontend + Backend + PostgreSQL, chạy hoàn toàn bằng Docker,
deploy tự động lên VPS bằng **GitHub Actions** (build image → GHCR → SSH deploy).

---

## 0. Phần mềm tuyển sinh liên kết Phoenix — xem demo

Nghiệp vụ trong [LOGIC.md](LOGIC.md) đã được hiện thực thành bảy màn hình chạy
được, theme lấy từ repo [phoenix-skills](https://github.com/khiemnguyendinh/phoenix-skills).

```bash
cd frontend && npm install && npm run dev
# mở http://localhost:5173/tuyensinh
```

Bản demo chạy **hoàn toàn trong trình duyệt**, dữ liệu ở `localStorage`, chưa cần
Docker hay PostgreSQL. Bộ chọn người dùng ở góc phải đứng chỗ của đăng nhập thật:
đổi người để xem phân quyền cán bộ / trưởng nhóm / trưởng phòng / quản trị.

Mã nguồn và phần còn thiếu trước khi chạy thật:
[frontend/src/features/tuyensinh/README.md](frontend/src/features/tuyensinh/README.md).
Engine tiền có bộ kiểm thử đối chiếu với từng con số trong LOGIC.md:

```bash
cd frontend && npm test
```

---

## 1. Giới thiệu & Tech stack

| Phần | Công nghệ |
|---|---|
| **Frontend** | React 18, Vite, TypeScript strict, React Router v6, TanStack Query v5, Axios (tự refresh token), Zustand, Tailwind CSS + shadcn/ui, React Hook Form + Zod, Vitest + Testing Library |
| **Backend** | Node.js 20, Express 4, TypeScript strict, Prisma 5, Zod (validate + sinh OpenAPI), JWT access/refresh (refresh xoay vòng, lưu cookie httpOnly), bcrypt, pino, helmet, cors, rate-limit, Swagger UI, Vitest + Supertest |
| **Database** | PostgreSQL 16 |
| **Hạ tầng** | Docker, Docker Compose, Caddy (SSL Let's Encrypt tự động), Nginx (phục vụ frontend tĩnh), GitHub Actions, GHCR |

**Kiến trúc backend** — mỗi module tự chứa đủ các lớp:

```
route  →  controller  →  service  →  repository  →  Prisma
(endpoint,   (nhận req,     (business     (nơi DUY NHẤT
 middleware)  trả response)  logic)        gọi Prisma)
```

> Mật khẩu được hash bằng `bcryptjs` (API giống hệt `bcrypt`, thuần JS nên không phải build native trên Alpine).

---

## 2. Yêu cầu cài đặt

- **Docker Desktop** (Windows/macOS) hoặc Docker Engine + Compose plugin v2 (Linux)
- **Git**
- (Tùy chọn) **Node.js 20+** nếu muốn chạy lint/test/Prisma Studio ngoài container
- (Tùy chọn) **make** — trên Windows dùng Git Bash/WSL, hoặc chạy trực tiếp lệnh `docker compose` tương ứng

---

## 3. Chạy môi trường dev

```bash
git clone <repo-url> && cd <repo>
cp .env.example .env          # không bắt buộc — compose đã có giá trị mặc định
docker compose up -d          # hoặc: make up
```

| Dịch vụ | URL |
|---|---|
| Frontend (hot reload) | http://localhost:5173 |
| Backend API (hot reload) | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| Health check | http://localhost:3000/api/health |
| PostgreSQL | `localhost:5432` (postgres / postgres / app_db) |
| pgAdmin (tùy chọn) | `make tools` → http://localhost:5050 |

Khi khởi động, container backend tự chạy `prisma migrate deploy` và seed tài khoản admin
(mặc định `admin@example.com` / `Admin@123456`).

---

## 4. Biến môi trường

File mẫu: [`.env.example`](.env.example) (dev) và [`.env.production.example`](.env.production.example) (prod).
Mọi secret đọc từ `.env`, **không hardcode, không commit**. Backend validate env bằng Zod
(`backend/src/config/env.ts`) — thiếu/sai biến là app dừng ngay khi khởi động.

| Biến | Mô tả |
|---|---|
| `DOMAIN_APP` / `DOMAIN_API` | Domain frontend / backend (prod), vd `app.example.com`, `api.example.com` |
| `ACME_EMAIL` | Email đăng ký Let's Encrypt |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Thông tin PostgreSQL |
| `DATABASE_URL` | Chuỗi kết nối Prisma (host `postgres` trong Docker) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secret ký JWT, **tối thiểu 32 ký tự**, hai giá trị khác nhau |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Thời hạn token: `15m`, `7d`... |
| `CORS_ORIGIN` | Origin được phép gọi API (domain frontend), nhiều giá trị cách nhau dấu phẩy |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Tài khoản admin được seed |
| `TAG` | Tag image đang chạy (GitHub Actions tự ghi = commit SHA) |
| `IMAGE_PREFIX` | `ghcr.io/<user>/<repo>` (GitHub Actions tự ghi) |
| `TRUST_PROXY` | Số proxy đứng trước backend (Caddy = `1`) |
| `SWAGGER_ENABLED` | Bật/tắt `/api/docs` |
| `LOG_LEVEL` | `fatal` `error` `warn` `info` `debug` `trace` `silent` |
| `TZ` / `BACKUP_RETENTION` / `RCLONE_REMOTE` | Múi giờ cron, số bản backup giữ lại, remote rclone (tùy chọn) |
| `VITE_API_URL` | URL API cho frontend — **nhúng lúc build** (prod: GitHub secret) |

Tạo secret mạnh:

```bash
openssl rand -base64 48
```

---

## 5. Cấu trúc thư mục

```
.
├── frontend/
│   ├── src/
│   │   ├── api/            # axios instance (interceptor token + refresh), hàm gọi API
│   │   ├── components/     # ui/ (shadcn), common/ (Pagination, FormField...)
│   │   ├── features/       # auth/, users/ — hooks, components, schema theo feature
│   │   ├── hooks/          # useDebounce...
│   │   ├── layouts/        # MainLayout, AuthLayout
│   │   ├── pages/          # Login, Register, Dashboard, Users, 404
│   │   ├── routes/         # router, ProtectedRoute, GuestRoute
│   │   ├── stores/         # zustand (auth)
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile          # multi-stage: build → nginx
│   ├── Dockerfile.dev
│   └── nginx.conf          # SPA fallback, cache static assets
├── backend/
│   ├── src/
│   │   ├── config/env.ts   # validate env bằng Zod
│   │   ├── lib/            # prisma, logger, jwt, password, zod (openapi)
│   │   ├── middlewares/    # authenticate, authorize, validate, error-handler, not-found, rate-limit
│   │   ├── utils/          # app-error, async-handler, response, pagination, duration
│   │   ├── modules/
│   │   │   ├── auth/       # route, controller, service, repository (refresh token), schema
│   │   │   ├── users/      # route, controller, service, repository, schema
│   │   │   └── health/
│   │   ├── docs/openapi.ts # sinh Swagger từ Zod schema
│   │   ├── routes.ts       # gom route vào /api
│   │   ├── app.ts          # tạo express app (export để test)
│   │   └── server.ts       # listen + graceful shutdown
│   ├── prisma/             # schema.prisma, migrations/, seed.ts
│   ├── tests/auth.test.ts  # Vitest + Supertest
│   ├── Dockerfile          # multi-stage, user non-root
│   └── Dockerfile.dev
├── caddy/
│   ├── Caddyfile
│   └── sites/monitoring.caddy.example
├── scripts/
│   ├── setup-vps.sh        # chuẩn bị VPS (chạy 1 lần)
│   ├── backup-db.sh
│   └── restore-db.sh
├── .github/workflows/
│   ├── ci.yml              # lint + test + build cho Pull Request
│   └── deploy.yml          # build → GHCR → copy file → deploy qua SSH
├── docker-compose.yml      # dev
├── docker-compose.prod.yml # production
├── .env.example
├── .env.production.example
└── Makefile
```

### API có sẵn

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/health` | public |
| POST | `/api/auth/register` · `/api/auth/login` | public |
| POST | `/api/auth/refresh` · `/api/auth/logout` | cookie `refresh_token` |
| GET | `/api/auth/me` | đăng nhập |
| GET | `/api/users?page=&limit=&search=&role=&sortBy=&sortOrder=` | ADMIN |
| POST | `/api/users` | ADMIN |
| GET | `/api/users/:id` | ADMIN hoặc chính mình |
| PATCH / DELETE | `/api/users/:id` | ADMIN |

Response luôn có dạng `{ success, data, message, meta }`; khi lỗi có thêm `error: { code, details }`.

---

## 6. Thêm module mới (ví dụ `products`)

1. **Prisma** — thêm model vào `backend/prisma/schema.prisma`:

   ```prisma
   model Product {
     id        String   @id @default(uuid()) @db.Uuid
     name      String
     price     Decimal  @db.Decimal(12, 2)
     createdAt DateTime @default(now()) @map("created_at")
     updatedAt DateTime @updatedAt @map("updated_at")

     @@map("products")
   }
   ```

   Tạo migration: `make migrate name=add_products`

2. **Copy module mẫu**: `cp -r backend/src/modules/users backend/src/modules/products`, đổi tên file
   thành `product.*.ts`, rồi sửa:
   - `product.schema.ts` — Zod schema cho body/query/params + `z.infer` DTO (import `z` từ `lib/zod`)
   - `product.repository.ts` — chỉ nơi này gọi `prisma.product.*`
   - `product.service.ts` — business logic, chỉ gọi repository, ném `AppError` (NotFound, Conflict...)
   - `product.controller.ts` — `asyncHandler` + `sendSuccess`, không chứa logic
   - `product.route.ts` — gắn `authenticate`, `authorize(...)`, `validate(schema)`
3. **Đăng ký route** trong `backend/src/routes.ts`: `routes.use('/products', productRouter);`
4. **Swagger**: thêm `registry.registerPath(...)` trong `backend/src/docs/openapi.ts`
5. **Frontend**: `src/api/products.api.ts` → `src/features/products/` (hooks TanStack Query, components)
   → `src/pages/ProductsPage.tsx` → khai báo route trong `src/routes/router.tsx`
6. **Test**: thêm `backend/tests/products.test.ts` (mock repository như `auth.test.ts`)

---

## 7. Lệnh Makefile thường dùng

| Lệnh | Tác dụng |
|---|---|
| `make up` / `make down` | Bật / tắt môi trường dev |
| `make logs s=backend` | Xem log (bỏ `s` để xem tất cả) |
| `make build` | Build lại image dev |
| `make migrate name=xxx` | Tạo & áp dụng migration |
| `make seed` | Seed admin |
| `make studio` | Prisma Studio (cần Node trên máy) |
| `make lint` / `make test` | Lint + typecheck / test cả backend & frontend |
| `make tools` | Bật pgAdmin |
| `make prod-up` / `make prod-logs` / `make prod-ps` | Quản lý production (trên VPS) |
| `make backup` | Backup DB ngay |
| `make restore FILE=<tên file>` | Khôi phục DB |

---

## 8. Triển khai lên VPS (CI/CD bằng GitHub Actions)

Mọi việc deploy đều do workflow `.github/workflows/deploy.yml` thực hiện. Trên VPS **không cần clone repo**,
chỉ cần một thư mục `APP_DIR` (mặc định `/opt/app`) chứa file `.env`.

```
push main ─► CI (lint+test) ─► build image ─► push GHCR ─► SCP compose/Caddyfile/scripts ─► SSH:
             pull → migrate → up → health check → seed admin → prune image
```

### Bước 1 — Trỏ DNS
Mặc định dùng **1 domain**: frontend ở `https://<domain>`, API ở `https://<domain>/api`
(Caddy chuyển `/api/*` sang backend). Chỉ cần 1 bản ghi **A** trỏ `<domain>` về IP VPS.
Kiểm tra: `dig +short <domain>`.

> Muốn tách API ra domain riêng (`api.example.com`): xem `caddy/sites/api.caddy.example`.

### Bước 2 — Chuẩn bị VPS (chạy 1 lần)
Đảm bảo bạn SSH vào root bằng **key** được, rồi:

```bash
scp scripts/setup-vps.sh root@<IP_VPS>:/root/
ssh root@<IP_VPS> "bash /root/setup-vps.sh deploy"
```

Script tạo user `deploy`, cài Docker + Compose, bật UFW (22/80/443), fail2ban, swap 2GB,
tắt đăng nhập SSH bằng mật khẩu, tạo `/opt/app`. **Mở terminal mới thử `ssh deploy@<IP_VPS>` trước khi
đóng phiên root.**

### Bước 3 — Tạo SSH key cho GitHub Actions

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ./gha_deploy -N ""
ssh-copy-id -i ./gha_deploy.pub deploy@<IP_VPS>
```

Nội dung file `gha_deploy` (private key) sẽ dùng cho secret `VPS_SSH_KEY`.

### Bước 4 — Tạo `.env` trên VPS

```bash
ssh deploy@<IP_VPS>
nano /opt/app/.env      # dán nội dung .env.production.example rồi sửa giá trị thật
chmod 600 /opt/app/.env
```

Bắt buộc đổi: `DOMAIN_*`, `ACME_EMAIL`, `POSTGRES_PASSWORD` (và trong `DATABASE_URL`), `JWT_*_SECRET`,
`CORS_ORIGIN=https://app.example.com`, `ADMIN_PASSWORD`.

### Bước 5 — Khai báo GitHub Secrets
*Repo → Settings → Secrets and variables → Actions*

| Secret | Giá trị |
|---|---|
| `VPS_HOST` | IP hoặc hostname VPS |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Nội dung private key `gha_deploy` |
| `VPS_PORT` | `22` |
| `VITE_API_URL` | `https://<domain>/api` (vd `https://hoahong.phoenixunix.edu.vn/api`) |

(Tùy chọn) Variable `APP_DIR` nếu không dùng `/opt/app`. Nên tạo Environment `production`
(Settings → Environments) để bật duyệt thủ công trước khi deploy.

### Bước 6 — Push lên `main`

```bash
git push origin main
```

Theo dõi tại tab **Actions**. Lần đầu Caddy mất khoảng 10–60 giây để lấy chứng chỉ SSL.

### Bước 7 — Kiểm tra
- `https://<domain>` → trang đăng nhập, đăng nhập bằng `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `https://<domain>/api/health` → `{"success":true,"data":{"status":"ok","database":"up",...}}`
- `https://<domain>/api/docs` → Swagger

### Rollback về phiên bản cũ
**Cách 1 (khuyên dùng):** *Actions → Deploy → Run workflow*, nhập commit SHA cũ vào ô `tag`.
Workflow bỏ qua bước build và deploy lại đúng image đó.

**Cách 2 (trên VPS):**

```bash
cd /opt/app
echo <GHCR_PAT> | docker login ghcr.io -u <github-user> --password-stdin   # nếu package private
TAG=<sha> docker compose -f docker-compose.prod.yml up -d
```

> Image trên GHCR mặc định là *private*. Workflow dùng `GITHUB_TOKEN` để pull trong lúc deploy.
> Muốn pull thủ công trên VPS thì tạo Personal Access Token quyền `read:packages`, hoặc đổi package sang public.

### Monitoring (tùy chọn)
Uptime Kuma và Dozzle (xem log, có basic auth) đặt sau Caddy:

```bash
cd /opt/app
cp caddy/sites/monitoring.caddy.example caddy/sites/monitoring.caddy
docker run --rm caddy:2-alpine caddy hash-password --plaintext 'mat-khau-manh'
# thêm DOMAIN_LOGS, DOMAIN_STATUS, MONITOR_USER, MONITOR_PASSWORD_HASH='<hash>' vào .env
docker compose -f docker-compose.prod.yml --profile monitoring up -d
docker compose -f docker-compose.prod.yml restart caddy
```

---

## 9. Backup & restore database

- Service `db-backup` chạy `scripts/backup-db.sh` **lúc 2h sáng mỗi ngày** (theo `TZ`), dùng `pg_dump`
  nén gzip, lưu vào `/opt/app/backups/<db>_YYYY-MM-DD_HHMMSS.sql.gz`, giữ `BACKUP_RETENTION` (mặc định 7) bản mới nhất.
- Backup ngay: `make backup`
- Xem log cron: `docker compose -f docker-compose.prod.yml logs db-backup`
- Khôi phục (tự dừng backend, ghi đè DB, bật lại backend):

  ```bash
  ls -lt backups/
  make restore FILE=app_db_2025-01-01_020000.sql.gz
  ```

- Tải backup về máy: `scp deploy@<IP_VPS>:/opt/app/backups/<file>.sql.gz .`
- **Đẩy lên S3 / Cloudflare R2 / Backblaze (tùy chọn)**: image `postgres:16-alpine` không có rclone,
  nên cách đơn giản nhất là cài rclone trên VPS (`sudo apt install rclone && rclone config`) rồi thêm cron cho user deploy:

  ```cron
  30 2 * * * rclone copy /opt/app/backups r2:my-bucket/db --max-age 24h
  ```

---

## 10. Xử lý sự cố thường gặp

### SSL không cấp được
- Kiểm tra DNS đã trỏ đúng IP: `dig +short app.example.com`
- Port 80 và 443 phải mở (UFW + firewall của nhà cung cấp VPS): `sudo ufw status`
- Xem log: `docker compose -f docker-compose.prod.yml logs caddy | grep -i -E "acme|error"`
- Let's Encrypt giới hạn số lần cấp: đừng restart liên tục; chờ rồi thử lại. Không xóa volume `caddy_data`.
- Nếu dùng Cloudflare proxy (đám mây cam), đặt SSL mode **Full (strict)** hoặc tạm tắt proxy để cấp lần đầu.

### Lỗi 502 Bad Gateway
- Backend/frontend chưa chạy hoặc unhealthy: `make prod-ps`, `make prod-logs s=backend`
- Backend thoát ngay khi khởi động thường do **env sai** — log sẽ in rõ biến nào lỗi.
- Kiểm tra health từ bên trong: `docker compose -f docker-compose.prod.yml exec backend wget -qO- localhost:3000/api/health`

### Migrate lỗi
- Xem trạng thái: `docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate status`
- Migration chết giữa chừng: sửa dữ liệu/SQL rồi đánh dấu
  `npx prisma migrate resolve --rolled-back <tên_migration>` (hoặc `--applied`), sau đó chạy lại workflow.
- **Luôn `make backup` trước** khi chạy migration nguy hiểm.
- Dev: lệch schema có thể reset bằng `docker compose exec backend npx prisma migrate reset` (XÓA dữ liệu dev).

### Hết RAM
- Xem mức dùng: `docker stats --no-stream`, `free -h`
- Đảm bảo swap đã bật (`swapon --show`); chỉnh `mem_limit` trong `docker-compose.prod.yml` cho phù hợp VPS.
- Container bị kill vì OOM: `docker inspect <container> | grep OOMKilled`.
- Tắt profile `monitoring` nếu VPS chỉ có 2GB.

### Lỗi CORS
- `CORS_ORIGIN` phải **khớp chính xác** origin frontend, gồm `https://` và không có `/` ở cuối:
  `CORS_ORIGIN=https://app.example.com`
- `VITE_API_URL` được nhúng lúc build — đổi secret thì phải chạy lại workflow để build lại frontend.
- Refresh token dùng cookie `SameSite=Strict`: frontend và API phải **cùng domain gốc**
  (`app.example.com` & `api.example.com` ✅, `myapp.com` & `api.other.com` ❌).

### Dev: hot reload không chạy trên Windows/macOS
- Frontend đã bật polling (`VITE_USE_POLLING=true`).
- Với backend, nên đặt source code trong WSL2 (`\\wsl$\...`) để file watcher nhận sự kiện thay đổi.
