# Vai trò
Bạn là Senior Full-stack Engineer. Hãy tạo một **base project (boilerplate) production-ready**
gồm Frontend + Backend + PostgreSQL, chạy hoàn toàn bằng Docker và deploy được lên VPS.
Code sạch, cấu trúc rõ ràng, dễ mở rộng, viết bằng TypeScript.

# Tech stack

## Frontend
- React 18 + Vite + TypeScript (strict mode)
- React Router v6 (routing, protected routes)
- TanStack Query (gọi API, cache), Axios (instance có interceptor gắn token + tự refresh token)
- Zustand (state global: auth, user)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod (validate form)
- ESLint + Prettier, alias `@/` trỏ tới `src/`
- `VITE_API_URL` nhận qua biến môi trường / build-arg

## Backend
- Node.js 20 + **Express 4** + TypeScript (strict mode)
- Prisma ORM + PostgreSQL 16
- Kiến trúc phân lớp **route → controller → service → repository**:
  - `route`: khai báo endpoint, gắn middleware (auth, validate)
  - `controller`: nhận request, gọi service, trả response. Không chứa business logic
  - `service`: business logic, chỉ gọi repository, không truy cập Prisma trực tiếp
  - `repository`: nơi duy nhất làm việc với Prisma
- Validate bằng **Zod**: middleware `validate(schema)` kiểm tra `body`, `query`, `params`;
  dùng `z.infer` để lấy type cho DTO
- Validate biến môi trường bằng Zod khi khởi động (`config/env.ts`). Thiếu biến thì dừng app ngay
- Auth: JWT (access + refresh token), bcrypt, middleware `authenticate` và `authorize(...roles)`
- Refresh token lưu trong cookie `httpOnly`, `secure`, `sameSite`
- Xử lý lỗi tập trung:
  - Class `AppError` (statusCode, message, code) cùng các lỗi con: NotFound, Unauthorized, Forbidden...
  - Wrapper `asyncHandler` để không phải viết try/catch ở mỗi controller
  - Middleware `errorHandler` chuyển ZodError, lỗi Prisma (P2002, P2025) thành response chuẩn
- Response thống nhất: `{ success, data, message, meta }` qua helper `sendSuccess` / `sendError`
- Bảo mật & tiện ích: helmet, cors (chỉ cho phép domain frontend), express-rate-limit,
  compression, cookie-parser, bật `trust proxy` để lấy đúng IP client
- Logger: pino + pino-http (gắn request id)
- Swagger: dùng `@asteasolutions/zod-to-openapi` sinh docs từ Zod schema,
  phục vụ bằng swagger-ui-express tại `/api/docs`
- Health check `GET /api/health` (có kiểm tra kết nối DB)
- Graceful shutdown: bắt SIGTERM/SIGINT, đóng server và `prisma.$disconnect()`
- Dev: `tsx watch`. Build: `tsup` hoặc `tsc`. Test: Vitest + Supertest

## Hạ tầng
- Docker + Docker Compose
- PostgreSQL 16 (có volume lưu data), pgAdmin cho môi trường dev (tùy chọn, dùng profile `tools`)
- **Caddy** làm reverse proxy ở production, tự cấp và gia hạn SSL Let's Encrypt
- Frontend production: build tĩnh, phục vụ bằng Nginx bên trong container
- CI/CD: GitHub Actions, đẩy image lên GHCR, deploy qua SSH

# Cấu trúc thư mục (monorepo)
```
project-root/
├── frontend/
│   ├── src/
│   │   ├── api/                # axios instance, các hàm gọi API
│   │   ├── components/         # ui/ (shadcn), common/
│   │   ├── features/           # auth/, users/ ... (theo feature)
│   │   ├── hooks/
│   │   ├── layouts/            # MainLayout, AuthLayout
│   │   ├── pages/
│   │   ├── routes/             # định nghĩa router, ProtectedRoute
│   │   ├── stores/             # zustand
│   │   ├── types/
│   │   └── utils/
│   ├── Dockerfile              # multi-stage: build -> nginx
│   ├── Dockerfile.dev
│   └── nginx.conf              # SPA fallback, cache static assets
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.ts          # validate env bằng Zod
│   │   ├── lib/
│   │   │   ├── prisma.ts       # Prisma client singleton
│   │   │   ├── logger.ts
│   │   │   └── jwt.ts
│   │   ├── middlewares/
│   │   │   ├── authenticate.ts
│   │   │   ├── authorize.ts
│   │   │   ├── validate.ts
│   │   │   ├── error-handler.ts
│   │   │   └── not-found.ts
│   │   ├── utils/
│   │   │   ├── app-error.ts
│   │   │   ├── async-handler.ts
│   │   │   ├── response.ts
│   │   │   └── pagination.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.route.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.schema.ts
│   │   │   ├── users/
│   │   │   │   ├── user.route.ts
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── user.schema.ts
│   │   │   └── health/
│   │   ├── docs/
│   │   │   └── openapi.ts
│   │   ├── routes.ts           # gom route các module vào /api
│   │   ├── app.ts              # tạo express app (export riêng để test)
│   │   └── server.ts           # listen + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── tests/
│   │   └── auth.test.ts        # Vitest + Supertest
│   ├── Dockerfile              # multi-stage, chạy bằng user non-root
│   ├── Dockerfile.dev
│   └── tsconfig.json
├── caddy/
│   └── Caddyfile
├── scripts/
│   ├── setup-vps.sh
│   ├── deploy.sh
│   ├── backup-db.sh
│   └── restore-db.sh
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint + test + build cho Pull Request
│       └── deploy.yml          # build, push image, deploy khi push main
├── docker-compose.yml          # môi trường dev (hot reload)
├── docker-compose.prod.yml     # môi trường production trên VPS
├── .env.example
├── .env.production.example
├── .dockerignore
├── .gitignore
├── Makefile
└── README.md
```

# Chức năng mẫu cần có
1. **Auth**: Register, Login, Refresh token, Logout, `GET /api/auth/me`
2. **Users CRUD**: phân trang, tìm kiếm, sắp xếp; phân quyền theo role (`ADMIN`, `USER`)
3. **Prisma schema**: model `User` (id uuid, email unique, password, name, role, createdAt, updatedAt)
   và `RefreshToken` (token hash, userId, expiresAt, revokedAt)
4. **Seed**: tạo sẵn 1 tài khoản admin, email/mật khẩu lấy từ biến môi trường
5. **Frontend**: trang Login, Register, Dashboard, danh sách Users (bảng + phân trang + tìm kiếm),
   trang 404; tự refresh token khi API trả 401; hết phiên thì chuyển về trang login

# Môi trường Dev (docker-compose.yml)
- `docker compose up -d` là chạy được toàn bộ:
  - Frontend: http://localhost:5173 (hot reload bằng volume mount)
  - Backend: http://localhost:3000/api (hot reload)
  - Swagger: http://localhost:3000/api/docs
  - PostgreSQL: localhost:5432
- Postgres có `healthcheck`; backend dùng `depends_on: condition: service_healthy`
- Backend tự chạy `prisma migrate deploy` khi container khởi động

# Môi trường Production trên VPS

## Môi trường đích
- VPS Ubuntu 22.04/24.04, 2 vCPU / 2–4GB RAM, domain đã trỏ về IP VPS:
  - `app.example.com` → frontend
  - `api.example.com` → backend
  (tên domain cấu hình qua biến môi trường)

## docker-compose.prod.yml
- Các service: `caddy`, `frontend`, `backend`, `postgres`, `db-backup`
- Chỉ Caddy mở port 80/443 ra ngoài. Frontend, backend, postgres **không publish port**,
  chỉ giao tiếp qua Docker network nội bộ. Postgres tuyệt đối không mở port 5432 ra internet
- Image lấy từ GHCR, không build trên VPS: `image: ghcr.io/<user>/<repo>-backend:${TAG:-latest}`
- `restart: unless-stopped`, đặt giới hạn tài nguyên (`mem_limit`), có healthcheck cho mọi service
- Giới hạn log: `logging: driver json-file, max-size 10m, max-file 3`
- Volume cho dữ liệu Postgres, dữ liệu/chứng chỉ Caddy và thư mục backup

## Caddyfile
- Đọc domain và email ACME từ biến môi trường
- Reverse proxy `app.*` → frontend:80, `api.*` → backend:3000
- Bật gzip/zstd và security headers (HSTS, X-Content-Type-Options, Referrer-Policy...)

## Dockerfile
- Backend: stage build chạy `npm ci && npx prisma generate && npm run build`;
  stage chạy dùng `node:20-alpine`, chỉ copy `dist/`, `node_modules` (production) và `prisma/`;
  chạy bằng user non-root
- Frontend: stage build `npm ci && npm run build` (nhận `VITE_API_URL` qua build-arg);
  stage chạy dùng `nginx:alpine`
- Có `.dockerignore` để image nhỏ gọn

## CI/CD bằng GitHub Actions
- `ci.yml`: chạy lint + test + build khi có Pull Request
- `deploy.yml`: chạy khi push lên nhánh `main`:
  1. Lint + test
  2. Build image frontend & backend, gắn tag theo commit SHA và `latest`, push lên GHCR
  3. SSH vào VPS (dùng `appleboy/ssh-action`), chạy `scripts/deploy.sh`
- Secrets cần khai báo trên GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_PORT`, `VITE_API_URL`
- Hướng dẫn rollback về tag cũ: `TAG=<sha> docker compose -f docker-compose.prod.yml up -d`

## Scripts
- `scripts/setup-vps.sh`: tạo user deploy (không dùng root), cài Docker + Compose plugin,
  bật UFW (chỉ mở 22, 80, 443), cài fail2ban, tạo swap 2GB, tắt đăng nhập SSH bằng mật khẩu
- `scripts/deploy.sh`: đăng nhập GHCR, `docker compose pull`, `up -d`,
  chạy `prisma migrate deploy`, kiểm tra `/api/health` (lỗi thì báo và thoát), `docker image prune -f`
- `scripts/backup-db.sh`: `pg_dump` nén gzip, đặt tên theo ngày, giữ 7 bản gần nhất
- `scripts/restore-db.sh`: khôi phục database từ một file backup

## Backup database
- Service `db-backup` chạy `backup-db.sh` hằng ngày lúc 2h sáng (cron trong container)
- (Tùy chọn) đẩy backup lên S3 / Cloudflare R2 / Backblaze bằng rclone

## Biến môi trường
- `.env.example` (dev) và `.env.production.example` (prod) có đủ biến: DOMAIN_APP, DOMAIN_API,
  ACME_EMAIL, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL,
  JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES,
  CORS_ORIGIN, ADMIN_EMAIL, ADMIN_PASSWORD, TAG
- Mọi secret đọc từ `.env`, không hardcode. File `.env` thật chỉ nằm trên VPS, không commit
- Hướng dẫn tạo secret mạnh: `openssl rand -base64 48`

## Theo dõi (tùy chọn)
- Uptime Kuma để theo dõi uptime, Dozzle để xem log container (đặt sau Caddy, có basic auth)

# Makefile
Có các lệnh: `up`, `down`, `logs`, `build`, `migrate`, `seed`, `studio` (Prisma Studio),
`lint`, `test`, `prod-up`, `prod-logs`, `backup`, `restore`

# Chất lượng code
- TypeScript strict, không dùng `any`; type của request lấy từ Zod schema
- Test API mẫu cho auth (Vitest + Supertest), test 1 component frontend (Vitest + Testing Library)
- Husky + lint-staged (tùy chọn)
- Mỗi module backend tự chứa đủ route/controller/service/repository/schema;
  thêm module mới thì copy module `users` làm mẫu

# README.md
Viết bằng tiếng Việt, gồm:
1. Giới thiệu & tech stack
2. Yêu cầu cài đặt
3. Chạy môi trường dev
4. Danh sách biến môi trường
5. Cấu trúc thư mục
6. Cách thêm một module mới (ví dụ module `products`)
7. Các lệnh Makefile thường dùng
8. **Triển khai lên VPS** từng bước: trỏ DNS → chạy setup-vps.sh → clone repo / copy compose
   → tạo `.env` → khai báo GitHub secrets → push `main` → kiểm tra https://app.example.com
9. Backup & restore database
10. Xử lý sự cố thường gặp: SSL không cấp được, lỗi 502, migrate lỗi, hết RAM, lỗi CORS

# Cách làm
1. Trình bày ngắn gọn kế hoạch và cấu trúc thư mục trước.
2. Tạo lần lượt từng file với nội dung **đầy đủ**, không viết tắt kiểu "// ... phần còn lại".
3. Làm theo thứ tự: Docker + DB → Backend → Frontend → Production/VPS → CI/CD → README.
4. Cuối cùng, liệt kê các bước chạy thử và kiểm tra: `docker compose up -d`, gọi `/api/health`,
   đăng nhập bằng tài khoản admin seed, mở Swagger.