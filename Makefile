# Các lệnh thường dùng. Gõ `make help` để xem danh sách.
COMPOSE      := docker compose
COMPOSE_PROD := docker compose -f docker-compose.prod.yml
s ?=

.DEFAULT_GOAL := help
.PHONY: help up down logs build tools migrate seed studio lint test prod-up prod-down prod-logs prod-ps backup restore

help: ## Hiển thị danh sách lệnh
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

# ---------- Dev ----------
up: ## Chạy môi trường dev (hot reload)
	$(COMPOSE) up -d

down: ## Dừng môi trường dev
	$(COMPOSE) down

logs: ## Xem log dev (make logs s=backend)
	$(COMPOSE) logs -f --tail=100 $(s)

build: ## Build lại image dev
	$(COMPOSE) build

tools: ## Chạy thêm pgAdmin (http://localhost:5050)
	$(COMPOSE) --profile tools up -d

migrate: ## Tạo & áp dụng migration mới (make migrate name=add_products)
	$(COMPOSE) exec backend npx prisma migrate dev $(if $(name),--name $(name),)

seed: ## Seed tài khoản admin
	$(COMPOSE) exec backend npx prisma db seed

studio: ## Mở Prisma Studio (chạy trên máy host, kết nối postgres dev qua localhost:POSTGRES_PORT)
	PORT=$$(grep -E '^POSTGRES_PORT=' .env 2>/dev/null | cut -d= -f2); \
	cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:$${PORT:-5432}/app_db?schema=public" npx prisma studio

lint: ## Lint + typecheck backend & frontend
	$(COMPOSE) exec -T backend npm run lint
	$(COMPOSE) exec -T frontend npm run lint

test: ## Chạy test backend & frontend
	$(COMPOSE) exec -T backend npm test
	$(COMPOSE) exec -T frontend npm test

# ---------- Production (chạy trên VPS, trong APP_DIR) ----------
prod-up: ## Khởi động production
	$(COMPOSE_PROD) up -d

prod-down: ## Dừng production
	$(COMPOSE_PROD) down

prod-logs: ## Xem log production (make prod-logs s=backend)
	$(COMPOSE_PROD) logs -f --tail=100 $(s)

prod-ps: ## Trạng thái các container production
	$(COMPOSE_PROD) ps

backup: ## Backup database ngay lập tức
	$(COMPOSE_PROD) exec db-backup /bin/sh /scripts/backup-db.sh

restore: ## Khôi phục database (make restore FILE=app_db_2025-01-01_020000.sql.gz)
	@test -n "$(FILE)" || (echo "Thiếu FILE. Ví dụ: make restore FILE=app_db_2025-01-01_020000.sql.gz"; ls -1t backups/*.sql.gz 2>/dev/null; exit 1)
	$(COMPOSE_PROD) stop backend
	$(COMPOSE_PROD) exec db-backup /bin/sh /scripts/restore-db.sh "$(FILE)" || ($(COMPOSE_PROD) start backend; exit 1)
	$(COMPOSE_PROD) start backend
