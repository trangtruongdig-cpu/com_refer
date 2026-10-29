# Thực hiện: React + Node/Express + PostgreSQL

Tài liệu từng bước để dựng lại hệ thống trong một dự án mới. **Tự chứa** — không
cần đọc file nào khác của dự án hiện tại, trừ hai chỗ có ghi rõ "copy từ".

Khác với [PROJECT.md](PROJECT.md) ở đúng một điểm: tầng định tuyến dùng
**Express** thay vì Fastify. Engine tiền và lược đồ dữ liệu không đổi.

> **Đọc mục 13 trước khi viết dòng code đầu tiên.** Đó là danh sách những chỗ đã
> thật sự làm sai trong quá trình thiết kế, mỗi dòng là một lần phải làm lại.

---

## 0. Chốt tham số trước — bước này chặn mọi thứ

Không có số thật thì code đúng vẫn ra tiền sai. Chốt xong mới viết code:

| # | Cần chốt | Ai quyết | Hiện đang giả định |
|---|---|---|---|
| 1 | Thuế trên phần đối tác trích về | Kế toán | 0 |
| 2 | Định mức Trường giữ lại mỗi kỳ | Hiệu trưởng | 500.000đ |
| 3 | Độ trễ đối soát thật từng trường đối tác | Theo hợp đồng | 5–6 tháng |
| 4 | Chỉ tiêu được ứng của giai đoạn thử việc | Hiệu trưởng | 3 hồ sơ |
| 5 | Vốn lưu động mỗi cán bộ | Hiệu trưởng | 25 triệu |
| 6 | Điều khoản hoàn ứng khi nghỉ việc giữa chừng | Hiệu trưởng + pháp chế | chưa có |
| 7 | Học phí và tỷ lệ trích thật từng ngành, từng trường | Theo hợp đồng | dữ liệu mẫu |

---

## 1. Phiên bản và bộ công cụ

| Tầng | Chọn | Ghi chú |
|---|---|---|
| Cơ sở dữ liệu | **PostgreSQL 16** | Bắt buộc, không phải tuỳ chọn — cần `EXCLUDE USING gist` |
| Chạy | **Node ≥ 22.6** | Chạy `.ts` trực tiếp bằng `--experimental-strip-types`, không cần bước biên dịch |
| Backend | **Express 5 + TypeScript** | |
| Truy vấn | **`pg`** (node-postgres), SQL viết tay | Không ORM. Lược đồ có `CHECK` nhiều cột, `EXCLUDE`, cột sinh, trigger — ORM không khai được, mà đó là những thứ đang giữ tiền khỏi tính sai |
| Kiểm tra đầu vào | **Zod** | Một lược đồ dùng cho cả kiểm tra thời gian chạy và kiểu TypeScript |
| Kiểm thử backend | **`node:test`** có sẵn | Không thêm gói nào |
| Frontend | **React 18 + Vite + TypeScript** | |
| Kiểm thử frontend | **Vitest** | Cần môi trường DOM |
| Lưu tệp | **MinIO** (tương thích S3) | Hồ sơ thí sinh là ảnh và PDF |
| Đóng gói | **Docker Compose** | |

```bash
node --version      # phải >= 22.6
docker --version
```

**Hai giới hạn của `--experimental-strip-types`**, biết trước để không mất thời gian:

1. **Import phải ghi đuôi `.ts`**: `import { nhanTyLe } from './tien.ts'`. Thiếu
   đuôi là lỗi lúc chạy.
2. **Không dùng `enum` và `namespace`.** Thay `enum` bằng union of string literal:
   `type VaiTro = 'NV' | 'TN' | 'TP' | 'admin'`. Dùng được luôn làm kiểu cho Zod.

---

## 2. Cấu trúc thư mục

```
phoenix-tuyensinh/
├── docker-compose.yml
├── .env.example
├── thuchien.md                       # ← tài liệu này
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── migrations/
│   │   ├── 001-luoc-do.sql           # 39 bảng, CHECK, trigger
│   │   ├── 002-exclude-hieu-luc.sql  # chặn chồng lấn khoảng hiệu lực
│   │   └── 003-danh-muc.sql          # dữ liệu danh mục
│   ├── scripts/
│   │   └── migrate.ts                # bộ chạy di trú ~40 dòng, xem mục 4.5
│   ├── src/
│   │   ├── main.ts                   # khởi tạo Express
│   │   ├── cau-hinh.ts               # đọc biến môi trường, có Zod kiểm
│   │   ├── db/
│   │   │   └── ket-noi.ts            # pool + setTypeParser ← MỤC 5, LÀM TRƯỚC
│   │   ├── engine/                   # ← tầng tiền, không biết gì về HTTP
│   │   │   ├── tien.ts               # copy nguyên văn, mục 6
│   │   │   ├── luy-tien.ts           # copy nguyên văn, mục 6
│   │   │   ├── repo.ts               # nạp tham số theo ngày hiệu lực
│   │   │   ├── quy-tac.ts
│   │   │   ├── tinh-hoa-hong.ts
│   │   │   ├── tran-chi.ts
│   │   │   └── ung-truoc.ts
│   │   ├── middleware/
│   │   │   ├── xac-thuc.ts           # JWT
│   │   │   ├── phan-quyen.ts         # 4 vai trò
│   │   │   └── loi.ts                # xử lý lỗi tập trung
│   │   └── api/
│   │       ├── danh-muc.ts
│   │       ├── ho-so.ts
│   │       ├── thu-tien.ts
│   │       ├── doi-soat.ts
│   │       ├── ky-luong.ts
│   │       └── bao-cao.ts
│   └── tests/
│       ├── ca-mau.json               # sinh ra, KHÔNG sửa tay, không lưu kho
│       ├── doi-sanh.test.ts
│       └── bat-bien.test.ts
│
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── api/                      # client gọi backend
│       ├── man/                      # màn hình
│       │   ├── MangLuoi.tsx
│       │   ├── ChiTietChuongTrinh.tsx
│       │   ├── LapHoSo.tsx
│       │   ├── ThuHocPhi.tsx
│       │   ├── DoanhSo.tsx
│       │   └── QuanTri/
│       ├── thanhphan/
│       └── lib/
│
└── may-do/                           # ← engine Python, chỉ để đối sánh
    ├── engine/                       # copy từ dự án hiện tại
    ├── tests/
    └── cli.py
```

**Nguyên tắc chia tầng:** `src/engine/` **không được import gì từ `express`, `pg`
hay `req`/`res`.** Nó nhận số vào, trả số ra. Đây là lý do nó kiểm thử được bằng
hàng chục nghìn ca mà không cần dựng server hay cơ sở dữ liệu.

---

## 3. Bước 1 — Dựng cụm Docker

`docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: phoenix
      POSTGRES_USER: phoenix
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Ho_Chi_Minh
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U phoenix"]
      interval: 5s
      retries: 10
    ports: ["5432:5432"]

  minio:
    image: minio/minio:RELEASE.2025-04-22T22-12-26Z
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports: ["9000:9000", "9001:9001"]

  api:
    build: ./backend
    environment:
      DATABASE_URL: postgres://phoenix:${DB_PASSWORD}@db:5432/phoenix
      MINIO_ENDPOINT: minio:9000
      JWT_SECRET: ${JWT_SECRET}
      TZ: Asia/Ho_Chi_Minh
    depends_on:
      db: { condition: service_healthy }
      minio: { condition: service_started }
    volumes:
      - ./backend:/app
      - /app/node_modules        # giữ node_modules trong ảnh, không để host ghi đè
    ports: ["8000:8000"]
    command: npm run dev

  web:
    build: ./frontend
    environment:
      VITE_API_URL: http://localhost:8000
    depends_on: [api]
    ports: ["5173:5173"]
    command: npm run dev -- --host

volumes:
  db_data:
  minio_data:
```

`.env.example`:

```
DB_PASSWORD=doi_mat_khau_nay
MINIO_USER=phoenix
MINIO_PASSWORD=doi_mat_khau_nay
JWT_SECRET=sinh_chuoi_ngau_nhien_64_ky_tu
```

```bash
cp .env.example .env     # sửa mật khẩu TRƯỚC khi chạy
docker compose up -d db
docker compose ps        # db phải "healthy"
```

**Nghiệm thu:** `docker compose exec db psql -U phoenix -c 'select version()'` trả về PostgreSQL 16.

---

## 4. Bước 2 — Lược đồ SQL

### 4.1 SQL viết tay là nguồn sự thật

Không để công cụ nào sinh lược đồ từ file mô tả. Lược đồ này sống bằng ràng buộc
mà ORM không khai được, và chính những ràng buộc đó giữ tiền khỏi tính sai.

Copy `db/01-schema.sql` của dự án hiện tại (39 bảng, 8 view, 4 trigger) rồi đổi
kiểu dữ liệu từ SQLite sang PostgreSQL:

| SQLite | PostgreSQL |
|---|---|
| `INTEGER PRIMARY KEY` | `BIGSERIAL PRIMARY KEY` |
| `TEXT` cho ngày (`'2026-01-01'`) | `DATE` |
| `INTEGER` cho cờ 0/1 | `BOOLEAN` |
| `REAL` cho tỷ lệ | `NUMERIC(8,6)` |

**Tiền luôn là `BIGINT` đồng.** Không `NUMERIC`, tuyệt đối không `FLOAT`.
`NUMERIC(8,6)` cho tỷ lệ đúng bằng sáu chữ số thập phân — tức phần triệu, khớp
với quy ước của engine ở mục 6.

### 4.2 Năm bất biến `CHECK` phải còn

Mất một trong năm dòng này là mất khả năng phát hiện tiền sai:

```sql
CHECK (hoc_phi = hoc_phi_moi_ky * so_ky)
CHECK (quy_chi_moi_ky = tien_trich_moi_ky - thue_moi_ky - dinh_muc_moi_ky)
CHECK (quy_chi_moi_ky > 0)
CHECK (hoc_phi = nop_doi_tac + thue + dinh_muc_dao_tao + quy_chi)
CHECK ((cap = 'PHONG' AND don_vi_cha_id IS NULL)
    OR (cap = 'NHOM'  AND don_vi_cha_id IS NOT NULL))
```

Dòng cuối là chỗ chặn hệ thống biến thành đa cấp: cây tổ chức **đúng ba cấp**,
ràng buộc ở tầng dữ liệu chứ không phải quy ước giữa người với người. Nghị định
40/2018/NĐ-CP chỉ cho bán hàng đa cấp với **hàng hoá**; đào tạo là dịch vụ.

Thêm trigger chặn tầng thứ tư:

```sql
CREATE OR REPLACE FUNCTION chan_tang_thu_tu() RETURNS trigger AS $$
BEGIN
  IF NEW.cap = 'NHOM'
     AND (SELECT cap FROM don_vi WHERE id = NEW.don_vi_cha_id) <> 'PHONG' THEN
    RAISE EXCEPTION
      'Nhóm chỉ được trực thuộc Phòng. Hệ thống giới hạn đúng 3 cấp.';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_don_vi_chan_tang_4
  BEFORE INSERT OR UPDATE OF don_vi_cha_id, cap ON don_vi
  FOR EACH ROW EXECUTE FUNCTION chan_tang_thu_tu();
```

Chuyển tương tự hai trigger còn lại: `trg_ky_luong_bat_bien` (không sửa được kỳ
lương đã chốt) và `trg_chan_lap_quy_khi_chua_nhan_tien` (không lập quỹ chi từ
đợt đối soát chưa nhận tiền).

### 4.3 Hiệu lực theo thời gian

Mọi bảng chính sách đều có `hieu_luc_tu` / `hieu_luc_den`. **Khoá nghiệp vụ là
`(ma, hieu_luc_tu)`, không phải `ma`** — nếu đặt `UNIQUE` trên cột đơn thì không
ban hành được phiên bản mới của cùng một mã.

`002-exclude-hieu-luc.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE cau_truc_hoc_phi
  ADD COLUMN hieu_luc daterange
    GENERATED ALWAYS AS (daterange(hieu_luc_tu, hieu_luc_den, '[)')) STORED,
  ADD CONSTRAINT cthp_khong_chong_lan
    EXCLUDE USING gist (san_pham_id WITH =, hieu_luc WITH &&);
```

Đây là lý do chính phải dùng PostgreSQL. SQLite không có ràng buộc này.

### 4.4 Năm bảng phải đóng lỗ — làm ngay ở bước này

Dự án hiện tại còn năm bảng thiếu ràng buộc. Đừng mang lỗ sang dự án mới:

| Bảng | Khoá phân nhóm | Hiện trạng | Hậu quả nếu bỏ qua |
|---|---|---|---|
| `cau_truc_hoc_phi` | `san_pham_id` | **chưa có khoá nào** | **Nặng nhất.** Hai bản hiệu lực chồng lấn cho một ngành ⇒ toàn bộ tiền của ngành đó sai mà không báo lỗi |
| `quy_tac_hoa_hong` | `vai_tro, san_pham_id, doi_tac_id, he_dao_tao` | chưa có khoá nào | Lấy nhầm quy tắc, im lặng |
| `cau_hinh_pv` | *(toàn bảng)* | chưa có khoá nào | PV sai ⇒ sai bậc ⇒ sai thưởng |
| `bang_bac` | `ma` | `UNIQUE` trên cột đơn | Không ban hành được phiên bản mới |
| `dau_viec` | `ma` | `UNIQUE` trên cột đơn | Không ban hành được phiên bản mới |

Các bảng đã đúng, giữ nguyên: `pv_san_pham`, `bieu_luy_tien`, `thuong_nguong`,
`co_cau_quy_chi`, `thu_lao_quan_ly`, `phu_cap_quan_ly`, `ty_le_cong_ds_tn`.

`doi_tac` và `don_vi` giữ `UNIQUE` trên mã: mã trường đối tác và mã đơn vị cần
duy nhất toàn cục, khoảng hiệu lực ở đó chỉ ghi thời hạn hợp đồng.

### 4.5 Bộ chạy di trú

Không cần thư viện. `scripts/migrate.ts`:

```ts
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pool } from '../src/db/ket-noi.ts';

const THU_MUC = new URL('../migrations/', import.meta.url).pathname;

const chay = async () => {
  const kn = await pool.connect();
  try {
    await kn.query(`CREATE TABLE IF NOT EXISTS _di_tru (
      ten TEXT PRIMARY KEY, chay_luc TIMESTAMPTZ NOT NULL DEFAULT now())`);
    const { rows } = await kn.query<{ ten: string }>('SELECT ten FROM _di_tru');
    const daChay = new Set(rows.map((r) => r.ten));
    const files = (await readdir(THU_MUC)).filter((f) => f.endsWith('.sql')).sort();

    for (const f of files) {
      if (daChay.has(f)) { console.log(`  bỏ qua ${f}`); continue; }
      const sql = await readFile(join(THU_MUC, f), 'utf8');
      await kn.query('BEGIN');
      try {
        await kn.query(sql);
        await kn.query('INSERT INTO _di_tru (ten) VALUES ($1)', [f]);
        await kn.query('COMMIT');
        console.log(`  ✓ ${f}`);
      } catch (e) {
        await kn.query('ROLLBACK');
        throw new Error(`di trú ${f} thất bại: ${(e as Error).message}`);
      }
    }
  } finally {
    kn.release();
    await pool.end();
  }
};

await chay();
```

Mỗi file chạy **trong một transaction riêng**. PostgreSQL cho phép DDL trong
transaction, nên một di trú lỗi giữa đường sẽ lùi sạch chứ không để lược đồ dở dang.

**Nghiệm thu:** `npm run migrate` hai lần liên tiếp — lần hai in toàn "bỏ qua",
không lỗi.

---

## 5. Bước 3 — Kết nối PostgreSQL

**Làm bước này TRƯỚC khi viết dòng truy vấn đầu tiên.** `pg` trả về ba kiểu sai
với mặc định, và sửa sau nghĩa là rà lại toàn bộ code đã viết.

`src/db/ket-noi.ts`:

```ts
import pg from 'pg';

// ── BẮT BUỘC: khai trước khi tạo pool ───────────────────────────────────────
pg.types.setTypeParser(20,   (v) => Number(v));  // int8    → number (tiền)
pg.types.setTypeParser(1700, (v) => v);          // numeric → giữ CHUỖI
pg.types.setTypeParser(1082, (v) => v);          // date    → giữ 'YYYY-MM-DD'
pg.types.setTypeParser(1114, (v) => v);          // timestamp      → giữ chuỗi
pg.types.setTypeParser(1184, (v) => v);          // timestamptz    → giữ chuỗi

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

/** Đổi NUMERIC(8,6) dạng chuỗi sang số nguyên phần triệu. KHÔNG parseFloat. */
export const sangPhanTrieu = (numeric: string): number => {
  const [nguyen, thap = ''] = numeric.trim().split('.');
  const am = nguyen.startsWith('-');
  const n = BigInt((am ? nguyen.slice(1) : nguyen) || '0');
  const t = BigInt((thap + '000000').slice(0, 6));
  const ppm = Number(n * 1_000_000n + t);
  return am ? -ppm : ppm;
};
```

### Vì sao từng dòng

**`1082` (`DATE`) là dòng dễ mất nhất, và mất nó thì không kiểm thử nào bắt được.**
Mặc định `pg` biến `DATE` thành đối tượng `Date` ở **nửa đêm giờ địa phương**.
Engine so sánh ngày hiệu lực bằng chuỗi ISO. Hệ quả: chính sách ban hành
`2026-07-01` có thể bị đọc thành `2026-06-30`, hệ thống lấy **sai phiên bản tham
số**, và engine vẫn đúng hoàn toàn nên mọi kiểm thử đều xanh.

**`20` (`int8`)** mặc định trả về chuỗi, vì `int8` có thể vượt số nguyên an toàn
của JavaScript. Với tiền đồng thì đổi sang `number` là an toàn: khoản lớn nhất
gặp được cỡ `10^9`, còn `Number.MAX_SAFE_INTEGER` là `9.007.199.254.740.991`.

**`1700` (`numeric`)** phải giữ chuỗi. `parseFloat` một tỷ lệ là mang sai số dấu
phẩy động trở lại đúng chỗ đã cố ý loại khỏi lược đồ. Đổi qua `sangPhanTrieu`.

**Nghiệm thu:** một truy vấn `SELECT hieu_luc_tu FROM bieu_luy_tien LIMIT 1` trả
về đúng chuỗi `'2026-07-01'`, không phải `Date`.

---

## 6. Bước 4 — Engine tiền

### 6.1 Bốn quy ước, mỗi quy ước ứng với một lỗi đã thật sự xảy ra

**Một — làm tròn nửa lên, XA KHỎI SỐ 0.** `Math.round` làm tròn về phía `+∞` nên
sai với số âm, mà mọi khoản thu hồi ứng trước và bút toán điều chỉnh đều âm:

| Giá trị | `Math.round` | Phải ra |
|---|---|---|
| `-0.5` | `-0` | `-1` |
| `-1.5` | `-1` | `-2` |
| `-2.5` | `-2` | `-3` |

**Hai — tỷ lệ là số nguyên phần triệu, không phải số thực.** Khớp với
`NUMERIC(8,6)` của lược đồ.

**Ba — cộng dồn nhiều tích thì phải dùng `BigInt`, và làm tròn MỘT LẦN ở cuối.**
Biểu luỹ tiến cộng tám khoảng; `8 × 10^15` là đã vượt số nguyên an toàn. Làm tròn
từng khoảng rồi cộng sẽ ra số khác.

**Bốn — phần dư của `phanBo` so bằng số nguyên chính xác, thế bằng về phần tử
đứng trước.** Hai phần dư có thể bằng nhau *tuyệt đối* mà vẫn khác nhau khi tính
bằng dấu phẩy động, vì số có độ lớn lớn hơn mất nhiều bit hơn lúc trừ phần nguyên:

| | phần dư đúng | tính bằng `double` |
|---|---|---|
| `[0]` của `19.956.477 × 44/102` | `6/17` | `0.3529411759227514` |
| `[1]` của `19.956.477 × 10/102` | `6/17` | `0.3529411763884127` |

`double` thấy `[1]` lớn hơn nên trao đồng lẻ sai người. Lỗi này đã bắt được thật
trên 4/2.090 ca ngẫu nhiên.

### 6.2 `src/engine/tien.ts` — copy nguyên văn

Mã dưới đây **đã đối sánh với engine Python trên 180.805 ca, 0 lệch.** Copy
nguyên văn, đừng viết lại:

```ts
/**
 * Số học tiền tệ cho bảng lương. Bản TypeScript của `engine/tien.py`.
 *
 * Ba quy ước, mỗi quy ước ứng với một lỗi đã thật sự xảy ra:
 *
 *  1. Tiền luôn là số nguyên đồng. `number` đủ chỗ: VND lớn nhất gặp được cỡ
 *     10^9, còn `Number.MAX_SAFE_INTEGER` là 9.007.199.254.740.991.
 *  2. Làm tròn nửa lên, XA KHỎI SỐ 0. `Math.round` làm tròn về phía +∞ nên sai
 *     với số âm — mà mọi khoản thu hồi ứng trước đều là số âm.
 *  3. Tỷ lệ truyền vào dưới dạng SỐ NGUYÊN PHẦN TRIỆU, không phải số thực.
 *     `NUMERIC(8,6)` của PostgreSQL đúng bằng sáu chữ số thập phân.
 *
 * Mọi con số ở đây đã đối sánh với engine Python qua `cli.py sinh-ca-mau`.
 */

/** Làm tròn một giá trị thực về số nguyên đồng, nửa lên, xa khỏi số 0. */
export function lamTronDong(giaTri: number): number {
  const ketQua = Math.sign(giaTri) * Math.round(Math.abs(giaTri));
  return ketQua === 0 ? 0 : ketQua;   // chuẩn hoá -0 thành 0
}

/** Nhân một khoản tiền với tỷ lệ cho dưới dạng số nguyên phần triệu. */
export function nhanTyLe(soTien: number, ppm: number): number {
  if (soTien === 0 || ppm === 0) return 0;
  return lamTronDong((soTien * ppm) / 1_000_000);
}

/** Chia `tu / mau` (BigInt) và làm tròn nửa lên, xa khỏi số 0. */
export function chiaLamTron(tu: bigint, mau: bigint): number {
  if (mau === 0n) throw new Error('chia cho 0');
  const am = tu < 0n !== mau < 0n;
  const a = tu < 0n ? -tu : tu;
  const m = mau < 0n ? -mau : mau;
  let thuong = a / m;
  if ((a % m) * 2n >= m) thuong += 1n;
  const ketQua = Number(am ? -thuong : thuong);
  return ketQua === 0 ? 0 : ketQua;
}

/** Số chữ số thập phân trong BIỂU DIỄN CHUỖI của x — khớp `str()` của Python. */
function soThapPhan(x: number): number {
  let s = String(x);
  let mu = 0;
  const e = s.search(/[eE]/);
  if (e >= 0) {
    mu = -Number.parseInt(s.slice(e + 1), 10);
    s = s.slice(0, e);
  }
  const i = s.indexOf('.');
  return Math.max(0, (i < 0 ? 0 : s.length - i - 1) + mu);
}

/** `x * 10^d` thành BigInt chính xác, đọc từ chuỗi nên không có sai số dấu phẩy động. */
function nhanLuyThua10(x: number, d: number): bigint {
  if (!Number.isFinite(x)) throw new Error(`không quy đổi được ${x}`);
  let s = String(x);
  let mu = 0;
  const e = s.search(/[eE]/);
  if (e >= 0) {
    mu = Number.parseInt(s.slice(e + 1), 10);
    s = s.slice(0, e);
  }
  let dau = 1n;
  if (s[0] === '-') { dau = -1n; s = s.slice(1); } else if (s[0] === '+') s = s.slice(1);
  const i = s.indexOf('.');
  if (i >= 0) { mu -= s.length - i - 1; s = s.slice(0, i) + s.slice(i + 1); }
  const tong = mu + d;
  if (tong < 0) throw new Error(`mất độ chính xác khi quy đổi ${x}`);
  return dau * BigInt(s === '' ? '0' : s) * 10n ** BigInt(tong);
}

/**
 * Chia `tongTien` theo `trongSo`, bảo đảm `sum(kết quả) === tongTien`.
 *
 * Phương pháp phần dư lớn nhất. Phần dư so sánh bằng SỐ NGUYÊN CHÍNH XÁC, không
 * phải `number`: hai phần dư bằng nhau tuyệt đối nhưng khác độ lớn sẽ mất số bit
 * khác nhau khi trừ bằng dấu phẩy động, và thế bằng bị phá vỡ sai hướng — lệch
 * đúng 1 đồng. Lỗi này đã bắt được thật trên 4/2.090 ca ngẫu nhiên.
 *
 * Khi phần dư bằng nhau, `sort` ổn định (ES2019+) giữ đúng thứ tự khai báo, nên
 * đồng lẻ về phần tử đứng trước. Engine Python cũng vậy.
 */
export function phanBo(tongTien: number, trongSo: readonly number[]): number[] {
  if (trongSo.length === 0) return [];
  const tongTrongSo = trongSo.reduce((a, b) => a + b, 0);
  if (tongTrongSo <= 0) {
    // Không có cơ sở phân bổ: dồn toàn bộ vào phần tử đầu để không thất thoát.
    return [tongTien, ...Array<number>(trongSo.length - 1).fill(0)];
  }

  const d = Math.max(soThapPhan(tongTrongSo), ...trongSo.map(soThapPhan));
  const mau = nhanLuyThua10(tongTrongSo, d);
  const T = BigInt(tongTien);

  const tu = trongSo.map((w) => T * nhanLuyThua10(w, d));
  // BigInt `/` cắt về phía 0 — đúng như `int()` của Python, không phải Math.floor
  const phanNguyen = tu.map((n) => Number(n / mau));
  const conThua = tongTien - phanNguyen.reduce((a, b) => a + b, 0);
  const du = tu.map((n, i) => n - BigInt(phanNguyen[i]) * mau);  // cùng mẫu ⇒ so trực tiếp

  const xep = trongSo
    .map((_, i) => i)
    .sort((a, b) => (du[b] > du[a] ? 1 : du[b] < du[a] ? -1 : 0));
  for (let i = 0; i < conThua; i++) phanNguyen[xep[i % xep.length]] += 1;
  return phanNguyen;
}

/** Định dạng tiền để in ra báo cáo: 1234567 -> '1.234.567đ'. */
export function dinhDang(soTien: number): string {
  return `${soTien.toLocaleString('vi-VN').replace(/[,  ]/g, '.')}đ`;
}
```

### 6.3 `src/engine/luy-tien.ts` — hạt nhân

Copy nguyên văn từ `backend/src/engine/luy-tien.ts` của dự án hiện tại. Phần
quyết định đúng/sai là ngữ nghĩa **bậc thang biên** — tỷ lệ gắn với ngưỡng `T` áp
cho **khoảng** `[T, T_kế_tiếp)`, không áp cho toàn bộ giá trị:

```ts
export function luyTien(bac: readonly BacRutGon[], giaTri: number): number {
  const b = sapXep(docBac(bac));
  if (giaTri <= b[0].nguongTu) return 0;      // dưới ngưỡng thấp nhất: không hưởng gì

  let tong = 0n;                               // ← BigInt, quy ước Ba
  for (let i = 0; i < b.length; i++) {
    const dayKhoang = b[i].nguongTu;
    if (giaTri <= dayKhoang) break;
    const tranKhoang = i + 1 < b.length ? b[i + 1].nguongTu : null;
    const dinh = tranKhoang === null ? giaTri : Math.min(giaTri, tranKhoang);
    const phan = dinh - dayKhoang;
    if (phan > 0) tong += BigInt(phan) * BigInt(b[i].ppm);
  }
  return chiaLamTron(tong, 1_000_000n);        // ← làm tròn MỘT LẦN
}
```

Ví dụ kiểm lại bằng tay, biểu `16M:5,6% | 25M:10% | 35M:13%`, doanh số 35.000.000đ:

```
  khoảng [16M, 25M):   9.000.000 × 5,6%  =   504.000
  khoảng [25M, 35M):  10.000.000 × 10%   = 1.000.000
  ─────────────────────────────────────────────────────
  tổng                                   = 1.504.000đ
```

### 6.4 Nguyên tắc không được nới

**Hoa hồng không bao giờ tính theo phần trăm học phí.** Luôn đi qua **quỹ chi**:

```
quỹ chi một kỳ = học phí một kỳ × tỷ lệ trích − thuế − định mức giữ lại
```

Ở hệ liên kết, Trường chỉ nhận tối đa 30% học phí. Tính hoa hồng theo phần trăm
học phí là chi nhiều hơn số tiền thật có.

**Mọi phép tính ở mức MỘT KỲ THU, không phải toàn khoá.** Lẫn hai cái sai gấp
đúng số kỳ.

---

## 7. Bước 5 — Kiểm thử đối sánh

Engine Python là **máy đo**. Đừng dịch tay 133 kiểm thử: Python sinh tập ca mẫu,
TypeScript phải khớp từng đồng.

Copy `engine/`, `tests/`, `cli.py` của dự án hiện tại vào `may-do/`.

`backend/package.json`:

```json
{
  "name": "phoenix-tuyensinh-backend",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.6" },
  "scripts": {
    "dev": "node --experimental-strip-types --watch src/main.ts",
    "migrate": "node --experimental-strip-types scripts/migrate.ts",
    "ca-mau": "cd ../may-do && python3 cli.py sinh-ca-mau > ../backend/tests/ca-mau.json",
    "pretest": "npm run ca-mau",
    "test": "node --experimental-strip-types --test tests/*.test.ts",
    "test:nhanh": "node --experimental-strip-types --test tests/*.test.ts"
  }
}
```

`pretest` tự sinh lại tập ca mẫu trước mỗi lần `npm test`, nên không bao giờ đối
sánh với tập cũ. Thêm `tests/ca-mau.json` vào `.gitignore` — nó là thứ sinh ra.

`backend/tests/doi-sanh.test.ts`: copy từ dự án hiện tại. Cách hoạt động:

```ts
const HAM: Record<string, (...vao: never[]) => unknown> = {
  lamTronDong, nhanTyLe, phanBo, luyTien, timBacDatDuoc,
};

for (const [ham, nhom] of theoHam) {
  test(`${ham} — ${nhom.length} ca`, () => {
    for (const ca of nhom) {
      assert.deepStrictEqual(HAM[ham](...ca.vao), ca.ra);
    }
  });
}
```

Tập ca mẫu gồm ba phần, và phần thứ hai mới là phần bắt được lỗi:

1. **Mốc đã đối chiếu tay** — ô Excel gốc, biểu lương cán bộ, mốc nửa đồng.
2. **Ca đối kháng dựng có chủ đích** — tích rơi đúng `x,5`; hai ngưỡng sát nhau;
   trọng số là bội của nhau để sinh nhiều thế bằng; thang bậc khai báo đảo thứ tự.
3. **Quét ngẫu nhiên hạt giống cố định** (`--hat-giong`, mặc định `20260701`).
   Tăng bằng `--so-ca`.

Hạt giống cố định nên hai lần chạy ra cùng một tập. **Tập ca mẫu khác nhau giữa
hai lần chạy là lỗi, không phải dao động.**

Thứ tự chuyển các mô-đun còn lại: **`tran-chi.ts` và `ung-truoc.ts` trước** — hai
mô-đun này chưa có một dòng JavaScript nào, mà đúng là hai chỗ quyết định tiền ra
khỏi quỹ. Mở rộng `sinh-ca-mau` khi chuyển đến mô-đun nào.

**Nghiệm thu:** `npm test` từ trạng thái sạch (chưa có `ca-mau.json`) phải đạt hết.

---

## 8. Bước 6 — Nạp tham số theo ngày hiệu lực

Mọi truy vấn tham số chính sách đều phải lọc theo ngày. Viết **một** hàm sinh
điều kiện, đừng rải `hieu_luc_tu <= $1` khắp code:

```ts
/** Sinh điều kiện hiệu lực cho một alias bảng. Phải có alias, nếu không JOIN sẽ nhập nhằng cột. */
export const hieuLuc = (alias: string): string =>
  `${alias}.hieu_luc_tu <= $1 AND (${alias}.hieu_luc_den IS NULL OR ${alias}.hieu_luc_den > $1)`;
```

**Luôn truyền alias.** Phiên bản đầu của dự án hiện tại dùng một hằng SQL không
có tiền tố bảng, và nó vỡ ngay khi có `JOIN` vì cột nhập nhằng.

Nạp một lần đầu request, dùng chung cho mọi phép tính trong request đó — không
truy vấn lại giữa đường, vì một request phải tính trên **một** phiên bản chính sách.

---

## 9. Bước 7 — API Express

### 9.1 Khung

`src/main.ts`:

```ts
import express from 'express';
import { loi } from './middleware/loi.ts';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => { res.json({ ok: true }); });

app.use('/danh-muc',    (await import('./api/danh-muc.ts')).router);
app.use('/ho-so',       (await import('./api/ho-so.ts')).router);
app.use('/lan-thu',     (await import('./api/thu-tien.ts')).router);
app.use('/dot-doi-soat',(await import('./api/doi-soat.ts')).router);
app.use('/ky-luong',    (await import('./api/ky-luong.ts')).router);

app.use(loi);                       // ← phải đăng ký SAU mọi route

app.listen(8000, '0.0.0.0', () => console.log('API cổng 8000'));
```

### 9.2 Bọc handler async

```ts
// src/middleware/bao.ts
import type { RequestHandler } from 'express';

export const bao = (h: RequestHandler): RequestHandler =>
  (req, res, next) => { Promise.resolve(h(req, res, next)).catch(next); };
```

Express 5 đã tự chuyển Promise bị reject sang middleware lỗi, nhưng bọc tường
minh thì chạy đúng trên cả 4 và 5, và không phụ thuộc vào việc nâng phiên bản.
Dùng `bao(...)` cho **mọi** handler async — bỏ sót một chỗ là một lỗi im lặng
treo request.

### 9.3 Kiểm đầu vào bằng Zod

```ts
import { z } from 'zod';

const TaoHoSo = z.object({
  san_pham_ma: z.string().min(1),
  thi_sinh: z.object({
    ho_ten: z.string().min(1),
    ngay_sinh: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // chuỗi ISO, không Date
    so_cccd: z.string().regex(/^\d{12}$/),
    dien_thoai: z.string().regex(/^0\d{9}$/),
  }),
  nguoi_lap_id: z.number().int().positive(),
});

router.post('/', bao(async (req, res) => {
  const vao = TaoHoSo.parse(req.body);          // ném ZodError -> middleware lỗi
  ...
}));
```

**Mọi trường tiền dùng `z.number().int()`.** `z.number()` trần nhận cả số thực.

### 9.4 Danh sách endpoint

| Phương thức | Đường dẫn | Việc |
|---|---|---|
| `GET` | `/danh-muc/truong` | Mạng lưới trường đối tác, lọc theo hệ |
| `GET` | `/danh-muc/chuong-trinh?truong=` | Ngành, số kỳ, học phí, điều kiện dự tuyển |
| `POST` | `/ho-so` | Lập hồ sơ thí sinh |
| `POST` | `/ho-so/:ma/tep` | Tải tệp lên MinIO, lưu khoá tham chiếu |
| `POST` | `/lan-thu` | Ghi nhận thu học phí — **bắt buộc số chứng từ** |
| `GET` | `/lan-thu/:id/qr` | Sinh chuỗi VietQR |
| `POST` | `/dot-doi-soat` | Nhập đợt đối tác trả tiền về |
| `POST` | `/dot-doi-soat/:id/khop` | Khớp với các lần thu ⇒ `DA_NHAN_TIEN` ⇒ lập quỹ chi |
| `GET` | `/nhan-su/:id/so-cong-no` | Sổ ứng trước và thực hưởng |
| `POST` | `/ky-luong` | Mở kỳ |
| `POST` | `/ky-luong/:id/chot` | Chốt kỳ — **chặn nếu vượt trần chi** |

### 9.5 Hai khái niệm không được lẫn

| | `lan_thu` | `dot_doi_soat` |
|---|---|---|
| Là gì | Học viên đóng tiền | Đối tác chuyển tiền về Trường |
| Ghi nhận | **Doanh số** | **Quỹ chi** |
| Thời điểm | Ngay khi thu | **4–6 tháng sau** |

Coi lúc học viên đóng tiền là lúc Trường có tiền là lỗi đã mắc một lần. Bảng
lương sẽ chi tiền chưa về.

### 9.6 VietQR

Chuỗi theo EMVCo TLV, CRC-16/CCITT-FALSE trên **byte UTF-8**. Kiểm chứng bằng giá
trị chuẩn `"123456789" → 0x29B1` chứ đừng tự dựng payload mẫu — payload không
đầy đủ (không kết thúc bằng `6304`) cho ra giá trị khác và rất dễ tin là đúng.

**Tuyệt đối không hardcode số tài khoản thật.** Thông tin ngân hàng là tham số
Trường tự điền. Màn hình thu tiền hiển thị **số tài khoản dạng chữ cạnh mã QR**
để người nộp đối chiếu được.

---

## 10. Bước 8 — Xác thực và phân quyền

| Vai trò | Xem | Ghi |
|---|---|---|
| `NV` | Danh mục, hồ sơ của mình, doanh số của mình | Lập hồ sơ, ghi nhận thu tiền |
| `TN` | Thêm: hồ sơ và doanh số của nhóm | Duyệt đồng thực hiện trong nhóm |
| `TP` | Thêm: toàn phòng | Duyệt đồng thực hiện, xem bảng lương |
| `admin` | Toàn bộ | Danh mục, cơ cấu quỹ chi, đợt đối soát, chốt kỳ lương |

Hai quy tắc không được nới, và cả hai đã chặn ở tầng dữ liệu bằng trigger — **API
không được đi vòng**:

- **Không ai sửa được kỳ lương đã chốt.** Sai sót đi qua bút toán điều chỉnh ở kỳ
  sau. Đây là nguyên tắc kế toán, không phải tuỳ chọn kỹ thuật.
- **Không ai lập quỹ chi từ đợt đối soát chưa nhận tiền.**

---

## 11. Bước 9 — Frontend React

| Màn hình | Nội dung |
|---|---|
| `MangLuoi` | Trường đối tác theo hệ (trung cấp / cao đẳng / đại học), số chương trình |
| `ChiTietChuongTrinh` | Điều kiện dự tuyển, hồ sơ cần nộp, **số kỳ**, **học phí mỗi kỳ** |
| `LapHoSo` | Biểu mẫu thí sinh, tải nhiều tệp, chụp ảnh từ điện thoại |
| `ThuHocPhi` | Mã QR + số tài khoản dạng chữ, xác nhận thu |
| `DoanhSo` | Sổ công nợ, tiến độ tới chỉ tiêu, trạng thái ngưỡng |
| `QuanTri` | Doanh số theo trường / nhóm / phòng, tiền đang chờ đối soát, bàn van |

**Chạy tốt ở bề ngang 400px.** Cán bộ dùng điện thoại ngoài hiện trường, đây là
yêu cầu chức năng chứ không phải trang trí.

**Frontend không tính lại tiền.** Gọi API lấy số. Logic tiền đã chép tay sang
JavaScript hai lần trong các bản dựng thử và cả hai lần đều phải đối chiếu lại
từng đồng — đừng tạo bản thứ ba.

---

## 12. Bước 10 — Kỳ lương và trần chi

Thứ tự bắt buộc:

1. `POST /ky-luong` — mở kỳ
2. **Chụp ảnh tham số** vào `snapshot_tham_so` trước khi tính. Kỳ lương phải tính
   lại được y nguyên sau khi chính sách đổi.
3. Tính bảng lương: ứng trước, thực hưởng, thu hồi, nợ cuối kỳ
4. **Kiểm tra trần chi — chặn chốt kỳ nếu vượt**
5. Chốt kỳ ⇒ `DA_CHOT`, bất biến
6. Bút toán điều chỉnh sang kỳ sau cho hoàn học phí và sai sót

### Tách chi biến đổi và chi cố định

| | Nguồn | Trần |
|---|---|---|
| **Chi biến đổi** | Quỹ chi từ đối tác trích về | Có, cứng |
| **Chi cố định** | Ngân sách lương | Riêng |

Trộn chi phí cố định vào quỹ biến đổi đã làm vỡ trần một lần. Chính bộ soát trần
tự viết đã bắt được khoản bội chi 2.520.000đ.

### Ứng trước là khoản phải thu, không phải chi phí

Sổ công nợ tự tất toán:

```ts
if (quyenLoi >= thamSo.mucSan) {
  const thuHoi = Math.min(no, quyenLoi - thamSo.mucSan);
  thucNhan = quyenLoi - thuHoi;
  no -= thuHoi;
} else if (dat) {                       // đạt chỉ tiêu hồ sơ ⇒ được ứng
  thucNhan = thamSo.mucSan;
  no += thamSo.mucSan - quyenLoi;
} else {                                // không đạt: chỉ có tiền duy trì học viên còn học
  thucNhan = quyenLoi;
}
```

Coi ứng trước là chi phí sẽ tưởng bội chi trong khi không.

---

## 13. Những chỗ tuyệt đối không được làm sai

Mỗi dòng là một lỗi đã thật sự xảy ra trong quá trình thiết kế.

### Nghiệp vụ

| Cạm bẫy | Hệ quả | Cách tránh |
|---|---|---|
| Tính hoa hồng theo phần trăm học phí | Phá sản ở hệ liên kết: Trường chỉ nhận 30% | Luôn đi qua quỹ chi |
| Dùng học phí toàn khoá thay vì một kỳ làm cơ sở | Sai gấp đúng số kỳ | Mọi phép tính ở mức một kỳ thu |
| Coi lúc học viên đóng tiền là lúc Trường có tiền | Bảng lương chi tiền chưa về | Tách `lan_thu` và `dot_doi_soat` |
| Trộn chi phí cố định vào quỹ biến đổi | Vỡ trần chi | Tách hai nguồn ngân sách |
| Coi ứng trước là chi phí | Tưởng bội chi trong khi không | Ứng trước là khoản phải thu |
| Cây tổ chức để quy ước thay vì ràng buộc | Thành đa cấp, vi phạm NĐ 40/2018 | `CHECK` + trigger chặn tầng 4 |

### Dữ liệu

| Cạm bẫy | Hệ quả | Cách tránh |
|---|---|---|
| `UNIQUE` trên cột đơn ở bảng có hiệu lực | Không ban hành được phiên bản mới | `UNIQUE (ma, hieu_luc_tu)` |
| Bảng hiệu lực không có khoá nào | Hai bản chồng lấn lọt vào, lấy nhầm im lặng | `EXCLUDE USING gist` (mục 4.4) |
| Dùng `FLOAT` cho tiền | Lệch vài đồng, đối soát không khớp | `BIGINT` đồng |
| Điều kiện hiệu lực không có tiền tố bảng | Vỡ ngay khi `JOIN`: cột nhập nhằng | `hieuLuc(alias)`, luôn truyền alias |
| Tính kỳ lương mà không chụp ảnh tham số | Không tính lại được sau khi chính sách đổi | `snapshot_tham_so` trước khi tính |

### JavaScript / Node

| Cạm bẫy | Hệ quả | Cách tránh |
|---|---|---|
| `Math.round` cho số âm | `-0.5` ra `-0`, phải ra `-1`. Lệch ở mọi khoản thu hồi ứng trước | `Math.sign(x) * Math.round(Math.abs(x))` |
| `pg` đọc `DATE` thành `Date` giờ địa phương | Hiệu lực `2026-07-01` đọc thành `2026-06-30`, lấy sai tham số, **không kiểm thử nào bắt được** | `setTypeParser(1082, v => v)` |
| `parseFloat` một `NUMERIC` | Sai số dấu phẩy động quay lại đúng chỗ đã loại khỏi lược đồ | `sangPhanTrieu`, số nguyên phần triệu |
| So phần dư `phanBo` bằng `number` | Thế bằng bị phá vỡ, đồng lẻ đi sai người. Đã xảy ra, 4/2.090 ca | Quy trọng số về nguyên qua *chuỗi*, so bằng `BigInt` |
| Làm tròn từng khoảng luỹ tiến rồi cộng | Khác kết quả cộng dồn rồi làm tròn một lần | Cộng `BigInt`, làm tròn **một lần** cuối |
| Quên `bao()` một handler async | Request treo im lặng | Bọc mọi handler async |
| Thiếu đuôi `.ts` trong import | Lỗi lúc chạy với `--experimental-strip-types` | Luôn ghi `from './tien.ts'` |
| `z.number()` cho tiền | Nhận cả số thực | `z.number().int()` |
| Để ORM sở hữu lược đồ | `EXCLUDE`, trigger, cột sinh bị bỏ mất | SQL viết tay là nguồn sự thật |

---

## 14. Nghiệm thu từng bước

Không sang bước sau khi bước trước chưa đạt.

| Bước | Điều kiện đạt |
|---|---|
| 0 | Bảy tham số ở mục 0 đã có số thật, có người ký |
| 1 | `docker compose ps` — `db` ở trạng thái `healthy` |
| 2 | `npm run migrate` hai lần liên tiếp, lần hai in toàn "bỏ qua" |
| 2 | Thử `INSERT` hai bản `cau_truc_hoc_phi` chồng lấn hiệu lực ⇒ **phải bị chặn** |
| 2 | Thử `INSERT` một `don_vi` cấp `NHOM` dưới một `NHOM` ⇒ **phải bị chặn** |
| 3 | `SELECT hieu_luc_tu` trả về chuỗi `'2026-07-01'`, không phải `Date` |
| 4–5 | `npm test` từ trạng thái sạch, đạt hết |
| 6 | Cùng một ngày hiệu lực, tham số nạp ra khớp số của `cli.py` bên `may-do/` |
| 7 | Nhập một hồ sơ thật, thu đủ 4 kỳ, nhập 4 đợt đối soát ⇒ sổ công nợ ra đúng |
| 8 | Tài khoản `NV` gọi API bảng lương ⇒ bị từ chối |
| 9 | Mở ở bề ngang 400px, không tràn ngang, chụp ảnh hồ sơ được |
| 10 | Dựng một kỳ vượt trần ⇒ **chốt kỳ bị chặn**, không phải chỉ cảnh báo |
| 11 | Sao lưu PostgreSQL và **phục hồi thử ít nhất một lần** |

---

## 15. Thứ tự ưu tiên nếu nguồn lực hạn chế

1. **Bước 0** — không có số thật thì phần mềm vô nghĩa
2. **Bước 1–6** — lược đồ, kết nối, engine, kiểm thử: nhập liệu bằng `psql` hoặc
   pgAdmin là kế toán đã dùng được
3. **Bước 10** — kỳ lương: trả lương đúng là việc gấp nhất sau khi có dữ liệu
4. **Bước 7** — API nghiệp vụ
5. **Bước 9** — giao diện cán bộ: trước đó vẫn nhập hộ được
6. **Bước 8, 11** — phân quyền và vận hành

Nếu chỉ làm được một nửa, làm nửa đầu cho xong hẳn thay vì làm dở cả hai.

---

## 16. Việc còn treo cần nhớ

| # | Nội dung | Ai quyết |
|---|---|---|
| 1 | Bảy tham số ở mục 0 | Kế toán, Hiệu trưởng, pháp chế |
| 2 | Có giữ bảng bậc thưởng theo khối lượng không | Hiệu trưởng |
| 3 | Chỉ tiêu thử việc 2 hay 3 hồ sơ | Hiệu trưởng |
| 4 | Rà soát pháp chế văn bản cơ chế trước khi ban hành | Pháp chế |

Mục 2: cơ chế hai phần hiện trả phẳng 60% quỹ chi cho cán bộ. Nếu muốn thưởng
thêm cho người làm nhiều, bảng `quy_tac_hoa_hong` đã hỗ trợ sẵn cách
`BAC_THEO_SO_LUONG` — chỉ cần khai dữ liệu, không phải sửa code.

Mục 3 là điểm đánh đổi thật: chỉ tiêu 3 hồ sơ/tháng khiến người mới không đạt sẽ
**không có thu nhập trong 5 tháng đầu**. Hạ xuống 2 hồ sơ thì nợ đỉnh tăng từ 25
triệu lên 33,2 triệu và tất toán muộn hơn, từ tháng 14 sang tháng 20.
