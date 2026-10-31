-- CreateEnum
CREATE TYPE "VaiTro" AS ENUM ('NV', 'TN', 'TP', 'ADMIN');

-- CreateEnum
CREATE TYPE "VaiTroQuyTac" AS ENUM ('NV', 'TN', 'TP', 'CTV');

-- CreateEnum
CREATE TYPE "CapDonVi" AS ENUM ('PHONG', 'NHOM');

-- CreateEnum
CREATE TYPE "MaHe" AS ENUM ('NH', 'SC', 'TC', 'CD', 'DH');

-- CreateEnum
CREATE TYPE "TrinhDoVao" AS ENUM ('THPT', 'NH', 'SC', 'TC', 'CD', 'DH');

-- CreateEnum
CREATE TYPE "TrangThaiHoSo" AS ENUM ('CHO_THANH_TOAN', 'DANG_HOC', 'DA_DU_HOC_PHI', 'THOI_HOC');

-- CreateEnum
CREATE TYPE "TrangThaiLanThu" AS ENUM ('CHO_DOI_SOAT', 'DA_NHAN_TIEN');

-- CreateEnum
CREATE TYPE "TrangThaiDot" AS ENUM ('CHUA_NHAN_TIEN', 'DA_NHAN_TIEN');

-- CreateEnum
CREATE TYPE "TrangThaiKyLuong" AS ENUM ('MO', 'DA_CHOT');

-- CreateEnum
CREATE TYPE "CoSoTinh" AS ENUM ('QUY_CHI', 'HOC_PHI', 'KHONG');

-- CreateEnum
CREATE TYPE "LoaiGiaTri" AS ENUM ('TY_LE', 'SO_TIEN');

-- CreateEnum
CREATE TYPE "CachXacDinh" AS ENUM ('CO_DINH', 'LUY_TIEN_THEO_TIEN', 'BAC_THEO_SO_LUONG');

-- CreateEnum
CREATE TYPE "LoaiBac" AS ENUM ('SO_LUONG', 'TIEN');

-- CreateEnum
CREATE TYPE "NhanhCongNo" AS ENUM ('THU_HOI', 'UNG_THEM', 'CHI_DUY_TRI');

-- CreateTable
CREATE TABLE "don_vi" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "cap" "CapDonVi" NOT NULL,
    "cha_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "don_vi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhan_su" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "vai_tro" "VaiTro" NOT NULL,
    "don_vi_id" UUID NOT NULL,
    "user_id" UUID,
    "hoat_dong" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nhan_su_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truong" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "la_phoenix" BOOLEAN NOT NULL DEFAULT false,
    "tre_thang" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "truong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chuong_trinh" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "truong_id" UUID NOT NULL,
    "he" "MaHe" NOT NULL,
    "ma_nganh" TEXT NOT NULL,
    "ten_nganh" TEXT NOT NULL,
    "tu_trinh_do" "TrinhDoVao" NOT NULL,
    "thoi_luong_thang" INTEGER NOT NULL,
    "so_ky" INTEGER NOT NULL,
    "hoc_phi_ky" BIGINT NOT NULL,
    "ty_le_trich_ppm" INTEGER NOT NULL,
    "thue_ppm" INTEGER NOT NULL DEFAULT 0,
    "dinh_muc_ky" BIGINT NOT NULL,
    "nganh_suc_khoe" BOOLEAN NOT NULL DEFAULT false,
    "da_doi_chieu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chuong_trinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tai_khoan" (
    "id" UUID NOT NULL,
    "ten_chu" TEXT NOT NULL,
    "ten_ngan_hang" TEXT NOT NULL,
    "bin" TEXT NOT NULL,
    "so_tai_khoan" TEXT NOT NULL,
    "hoat_dong" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tai_khoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ho_so" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "chuong_trinh_id" UUID NOT NULL,
    "ho_ten" TEXT NOT NULL,
    "ngay_sinh" DATE,
    "so_cccd" TEXT NOT NULL,
    "dien_thoai" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "dia_chi" TEXT NOT NULL DEFAULT '',
    "trinh_do" TEXT NOT NULL DEFAULT '',
    "noi_cong_tac" TEXT NOT NULL DEFAULT '',
    "ghi_chu" TEXT NOT NULL DEFAULT '',
    "nhan_su_id" UUID NOT NULL,
    "ngay_lap" DATE NOT NULL,
    "trang_thai" "TrangThaiHoSo" NOT NULL DEFAULT 'CHO_THANH_TOAN',
    "ky_da_thu" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ho_so_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tep_dinh_kem" (
    "id" UUID NOT NULL,
    "ho_so_id" UUID NOT NULL,
    "muc" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tep_dinh_kem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lan_thu" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "ho_so_id" UUID NOT NULL,
    "ky_thu" INTEGER NOT NULL,
    "ngay_thu" DATE NOT NULL,
    "so_tien" BIGINT NOT NULL,
    "so_chung_tu" TEXT NOT NULL,
    "bien_lai_ten" TEXT,
    "tai_khoan_id" UUID NOT NULL,
    "nhan_su_id" UUID NOT NULL,
    "dot_doi_soat_id" UUID,
    "trang_thai" "TrangThaiLanThu" NOT NULL DEFAULT 'CHO_DOI_SOAT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lan_thu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dot_doi_soat" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "truong_id" UUID NOT NULL,
    "ngay_lap" DATE NOT NULL,
    "ngay_nhan_tien" DATE,
    "trang_thai" "TrangThaiDot" NOT NULL DEFAULT 'CHUA_NHAN_TIEN',
    "ghi_chu" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dot_doi_soat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "co_cau_quy_chi" (
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "ppm" INTEGER NOT NULL,
    "theo_hoa_don" BOOLEAN NOT NULL DEFAULT false,
    "hieu_luc_tu" DATE NOT NULL,
    "hieu_luc_den" DATE,
    "ghi_chu" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "co_cau_quy_chi_pkey" PRIMARY KEY ("ma","hieu_luc_tu")
);

-- CreateTable
CREATE TABLE "dau_viec" (
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "trong_so_ppm" INTEGER NOT NULL,
    "hieu_luc_tu" DATE NOT NULL,
    "hieu_luc_den" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dau_viec_pkey" PRIMARY KEY ("ma","hieu_luc_tu")
);

-- CreateTable
CREATE TABLE "bieu_luy_tien" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "hieu_luc_tu" DATE NOT NULL,
    "hieu_luc_den" DATE,
    "ghi_chu" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bieu_luy_tien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bieu_luy_tien_bac" (
    "id" UUID NOT NULL,
    "bieu_id" UUID NOT NULL,
    "nguong_tu" BIGINT NOT NULL,
    "ppm" INTEGER NOT NULL,

    CONSTRAINT "bieu_luy_tien_bac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thuong_nguong" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL DEFAULT 'THUONG_NGUONG',
    "nguong_tu" BIGINT NOT NULL,
    "so_tien" BIGINT NOT NULL,
    "hieu_luc_tu" DATE NOT NULL,
    "hieu_luc_den" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thuong_nguong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quy_tac_tinh_tien" (
    "id" UUID NOT NULL,
    "ma" TEXT NOT NULL,
    "vai_tro" "VaiTroQuyTac" NOT NULL,
    "pham_vi_nganh" TEXT,
    "pham_vi_truong" TEXT,
    "pham_vi_he" "MaHe",
    "co_so" "CoSoTinh" NOT NULL,
    "loai_gia_tri" "LoaiGiaTri" NOT NULL,
    "cach_xac_dinh" "CachXacDinh" NOT NULL,
    "gia_tri_ppm" INTEGER,
    "so_tien" BIGINT,
    "tran_ppm" INTEGER,
    "hieu_luc_tu" DATE NOT NULL,
    "hieu_luc_den" DATE,
    "ghi_chu" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quy_tac_tinh_tien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quy_tac_bac" (
    "id" UUID NOT NULL,
    "quy_tac_id" UUID NOT NULL,
    "loai" "LoaiBac" NOT NULL,
    "nguong_tu" BIGINT NOT NULL,
    "ppm" INTEGER NOT NULL,

    CONSTRAINT "quy_tac_bac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tham_so_co_che" (
    "id" UUID NOT NULL,
    "muc_san" BIGINT NOT NULL,
    "chi_tieu_ho_so" INTEGER NOT NULL,
    "hieu_luc_tu" DATE NOT NULL,
    "hieu_luc_den" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tham_so_co_che_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ky_luong" (
    "id" UUID NOT NULL,
    "thang" TEXT NOT NULL,
    "trang_thai" "TrangThaiKyLuong" NOT NULL DEFAULT 'MO',
    "ngay_mo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngay_chot" TIMESTAMP(3),
    "snapshot" JSONB NOT NULL,
    "tong_thuc_nhan" BIGINT NOT NULL DEFAULT 0,
    "thu_lao_tn" BIGINT NOT NULL DEFAULT 0,
    "thu_lao_tp" BIGINT NOT NULL DEFAULT 0,
    "quy_chi_phat_sinh" BIGINT NOT NULL DEFAULT 0,
    "vuot_tran" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ky_luong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bang_luong_dong" (
    "id" UUID NOT NULL,
    "ky_luong_id" UUID NOT NULL,
    "nhan_su_id" UUID NOT NULL,
    "so_ho_so_moi" INTEGER NOT NULL DEFAULT 0,
    "so_ky_thu" INTEGER NOT NULL DEFAULT 0,
    "hoc_phi_thuc_thu" BIGINT NOT NULL DEFAULT 0,
    "doanh_so_quy_doi" BIGINT NOT NULL DEFAULT 0,
    "luong_mem" BIGINT NOT NULL DEFAULT 0,
    "thuong_nguong" BIGINT NOT NULL DEFAULT 0,
    "quyen_loi" BIGINT NOT NULL DEFAULT 0,
    "ung_them" BIGINT NOT NULL DEFAULT 0,
    "thu_hoi" BIGINT NOT NULL DEFAULT 0,
    "thuc_nhan" BIGINT NOT NULL DEFAULT 0,
    "no_cuoi_ky" BIGINT NOT NULL DEFAULT 0,
    "nhanh" "NhanhCongNo" NOT NULL DEFAULT 'CHI_DUY_TRI',

    CONSTRAINT "bang_luong_dong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gia_dinh" (
    "id" UUID NOT NULL,
    "so" INTEGER NOT NULL,
    "tham_so" TEXT NOT NULL,
    "dang_dung" TEXT NOT NULL,
    "trang_thai" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gia_dinh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "don_vi_ma_key" ON "don_vi"("ma");

-- CreateIndex
CREATE INDEX "don_vi_cha_id_idx" ON "don_vi"("cha_id");

-- CreateIndex
CREATE UNIQUE INDEX "nhan_su_ma_key" ON "nhan_su"("ma");

-- CreateIndex
CREATE UNIQUE INDEX "nhan_su_user_id_key" ON "nhan_su"("user_id");

-- CreateIndex
CREATE INDEX "nhan_su_don_vi_id_idx" ON "nhan_su"("don_vi_id");

-- CreateIndex
CREATE INDEX "nhan_su_vai_tro_idx" ON "nhan_su"("vai_tro");

-- CreateIndex
CREATE UNIQUE INDEX "truong_ma_key" ON "truong"("ma");

-- CreateIndex
CREATE UNIQUE INDEX "chuong_trinh_ma_key" ON "chuong_trinh"("ma");

-- CreateIndex
CREATE INDEX "chuong_trinh_truong_id_idx" ON "chuong_trinh"("truong_id");

-- CreateIndex
CREATE INDEX "chuong_trinh_he_idx" ON "chuong_trinh"("he");

-- CreateIndex
CREATE UNIQUE INDEX "ho_so_ma_key" ON "ho_so"("ma");

-- CreateIndex
CREATE INDEX "ho_so_chuong_trinh_id_idx" ON "ho_so"("chuong_trinh_id");

-- CreateIndex
CREATE INDEX "ho_so_nhan_su_id_idx" ON "ho_so"("nhan_su_id");

-- CreateIndex
CREATE INDEX "ho_so_trang_thai_idx" ON "ho_so"("trang_thai");

-- CreateIndex
CREATE INDEX "ho_so_ngay_lap_idx" ON "ho_so"("ngay_lap");

-- CreateIndex
CREATE INDEX "tep_dinh_kem_ho_so_id_idx" ON "tep_dinh_kem"("ho_so_id");

-- CreateIndex
CREATE UNIQUE INDEX "lan_thu_ma_key" ON "lan_thu"("ma");

-- CreateIndex
CREATE INDEX "lan_thu_nhan_su_id_ngay_thu_idx" ON "lan_thu"("nhan_su_id", "ngay_thu");

-- CreateIndex
CREATE INDEX "lan_thu_dot_doi_soat_id_idx" ON "lan_thu"("dot_doi_soat_id");

-- CreateIndex
CREATE INDEX "lan_thu_trang_thai_idx" ON "lan_thu"("trang_thai");

-- CreateIndex
CREATE UNIQUE INDEX "lan_thu_ho_so_id_ky_thu_key" ON "lan_thu"("ho_so_id", "ky_thu");

-- CreateIndex
CREATE UNIQUE INDEX "dot_doi_soat_ma_key" ON "dot_doi_soat"("ma");

-- CreateIndex
CREATE INDEX "dot_doi_soat_truong_id_idx" ON "dot_doi_soat"("truong_id");

-- CreateIndex
CREATE INDEX "dot_doi_soat_trang_thai_idx" ON "dot_doi_soat"("trang_thai");

-- CreateIndex
CREATE INDEX "co_cau_quy_chi_hieu_luc_tu_idx" ON "co_cau_quy_chi"("hieu_luc_tu");

-- CreateIndex
CREATE INDEX "dau_viec_hieu_luc_tu_idx" ON "dau_viec"("hieu_luc_tu");

-- CreateIndex
CREATE UNIQUE INDEX "bieu_luy_tien_ma_hieu_luc_tu_key" ON "bieu_luy_tien"("ma", "hieu_luc_tu");

-- CreateIndex
CREATE UNIQUE INDEX "bieu_luy_tien_bac_bieu_id_nguong_tu_key" ON "bieu_luy_tien_bac"("bieu_id", "nguong_tu");

-- CreateIndex
CREATE INDEX "thuong_nguong_hieu_luc_tu_idx" ON "thuong_nguong"("hieu_luc_tu");

-- CreateIndex
CREATE UNIQUE INDEX "thuong_nguong_ma_hieu_luc_tu_nguong_tu_key" ON "thuong_nguong"("ma", "hieu_luc_tu", "nguong_tu");

-- CreateIndex
CREATE INDEX "quy_tac_tinh_tien_vai_tro_hieu_luc_tu_idx" ON "quy_tac_tinh_tien"("vai_tro", "hieu_luc_tu");

-- CreateIndex
CREATE UNIQUE INDEX "quy_tac_tinh_tien_ma_hieu_luc_tu_key" ON "quy_tac_tinh_tien"("ma", "hieu_luc_tu");

-- CreateIndex
CREATE UNIQUE INDEX "quy_tac_bac_quy_tac_id_nguong_tu_key" ON "quy_tac_bac"("quy_tac_id", "nguong_tu");

-- CreateIndex
CREATE UNIQUE INDEX "tham_so_co_che_hieu_luc_tu_key" ON "tham_so_co_che"("hieu_luc_tu");

-- CreateIndex
CREATE UNIQUE INDEX "ky_luong_thang_key" ON "ky_luong"("thang");

-- CreateIndex
CREATE INDEX "ky_luong_trang_thai_idx" ON "ky_luong"("trang_thai");

-- CreateIndex
CREATE INDEX "bang_luong_dong_nhan_su_id_idx" ON "bang_luong_dong"("nhan_su_id");

-- CreateIndex
CREATE UNIQUE INDEX "bang_luong_dong_ky_luong_id_nhan_su_id_key" ON "bang_luong_dong"("ky_luong_id", "nhan_su_id");

-- CreateIndex
CREATE UNIQUE INDEX "gia_dinh_so_key" ON "gia_dinh"("so");

-- AddForeignKey
ALTER TABLE "don_vi" ADD CONSTRAINT "don_vi_cha_id_fkey" FOREIGN KEY ("cha_id") REFERENCES "don_vi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhan_su" ADD CONSTRAINT "nhan_su_don_vi_id_fkey" FOREIGN KEY ("don_vi_id") REFERENCES "don_vi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhan_su" ADD CONSTRAINT "nhan_su_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chuong_trinh" ADD CONSTRAINT "chuong_trinh_truong_id_fkey" FOREIGN KEY ("truong_id") REFERENCES "truong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_chuong_trinh_id_fkey" FOREIGN KEY ("chuong_trinh_id") REFERENCES "chuong_trinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ho_so" ADD CONSTRAINT "ho_so_nhan_su_id_fkey" FOREIGN KEY ("nhan_su_id") REFERENCES "nhan_su"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tep_dinh_kem" ADD CONSTRAINT "tep_dinh_kem_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lan_thu" ADD CONSTRAINT "lan_thu_ho_so_id_fkey" FOREIGN KEY ("ho_so_id") REFERENCES "ho_so"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lan_thu" ADD CONSTRAINT "lan_thu_tai_khoan_id_fkey" FOREIGN KEY ("tai_khoan_id") REFERENCES "tai_khoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lan_thu" ADD CONSTRAINT "lan_thu_nhan_su_id_fkey" FOREIGN KEY ("nhan_su_id") REFERENCES "nhan_su"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lan_thu" ADD CONSTRAINT "lan_thu_dot_doi_soat_id_fkey" FOREIGN KEY ("dot_doi_soat_id") REFERENCES "dot_doi_soat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dot_doi_soat" ADD CONSTRAINT "dot_doi_soat_truong_id_fkey" FOREIGN KEY ("truong_id") REFERENCES "truong"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bieu_luy_tien_bac" ADD CONSTRAINT "bieu_luy_tien_bac_bieu_id_fkey" FOREIGN KEY ("bieu_id") REFERENCES "bieu_luy_tien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quy_tac_bac" ADD CONSTRAINT "quy_tac_bac_quy_tac_id_fkey" FOREIGN KEY ("quy_tac_id") REFERENCES "quy_tac_tinh_tien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bang_luong_dong" ADD CONSTRAINT "bang_luong_dong_ky_luong_id_fkey" FOREIGN KEY ("ky_luong_id") REFERENCES "ky_luong"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bang_luong_dong" ADD CONSTRAINT "bang_luong_dong_nhan_su_id_fkey" FOREIGN KEY ("nhan_su_id") REFERENCES "nhan_su"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
--  BẤT BIẾN NGHIỆP VỤ Ở TẦNG CƠ SỞ DỮ LIỆU
--
--  Prisma không diễn đạt được CHECK và TRIGGER, nên phần này viết tay. Lý do
--  đặt ở đây chứ không chỉ ở service: hệ nhiều người dùng có nhiều đường ghi
--  (API, job, psql, lần nhập liệu tay lúc sự cố). Bất biến nào chỉ nằm ở tầng
--  ứng dụng thì sớm muộn cũng có đường đi vòng qua nó.
-- ============================================================================

-- Nhân tiền với tỷ lệ ppm, làm tròn NỬA LÊN XA KHỎI SỐ 0 — đúng ngữ nghĩa
-- `lamTronDong`/`nhanTyLe` của engine. `round()` trên numeric của PostgreSQL
-- làm tròn xa khỏi 0, nên hai bên khớp nhau; dùng chia số nguyên sẽ lệch 1 đồng.
CREATE OR REPLACE FUNCTION ppm_nhan(so_tien BIGINT, ppm INTEGER)
RETURNS BIGINT
LANGUAGE sql
IMMUTABLE
STRICT
AS $fn$
  SELECT CASE
    WHEN so_tien = 0 OR ppm = 0 THEN 0::BIGINT
    ELSE sign(so_tien::numeric * ppm)::BIGINT
         * round(abs(so_tien::numeric * ppm) / 1000000)::BIGINT
  END;
$fn$;

-- --------------------------------------------------------------------------
--  1. CHƯƠNG TRÌNH — bảo toàn học phí và quỹ chi phải DƯƠNG
--
--  quỹ chi một kỳ = học phí × tỷ lệ trích − thuế − định mức giữ lại
--
--  Quỹ chi âm nghĩa là chương trình lỗ ngay từ thiết kế: mọi khoản chi phía sau
--  đều lấy từ nó, nên chặn ngay lúc khai báo chứ không đợi tới kỳ lương.
-- --------------------------------------------------------------------------
ALTER TABLE "chuong_trinh"
  ADD CONSTRAINT "chk_chuong_trinh_hoc_phi" CHECK ("hoc_phi_ky" > 0),
  ADD CONSTRAINT "chk_chuong_trinh_dinh_muc" CHECK ("dinh_muc_ky" >= 0),
  ADD CONSTRAINT "chk_chuong_trinh_so_ky" CHECK ("so_ky" >= 1),
  ADD CONSTRAINT "chk_chuong_trinh_thoi_luong" CHECK ("thoi_luong_thang" >= 1),
  ADD CONSTRAINT "chk_chuong_trinh_ty_le" CHECK ("ty_le_trich_ppm" BETWEEN 0 AND 1000000),
  ADD CONSTRAINT "chk_chuong_trinh_thue" CHECK ("thue_ppm" BETWEEN 0 AND 1000000),
  ADD CONSTRAINT "chk_chuong_trinh_quy_chi_duong" CHECK (
    ppm_nhan("hoc_phi_ky", "ty_le_trich_ppm")
    - ppm_nhan(ppm_nhan("hoc_phi_ky", "ty_le_trich_ppm"), "thue_ppm")
    - "dinh_muc_ky" > 0
  );

ALTER TABLE "truong"
  ADD CONSTRAINT "chk_truong_tre_thang" CHECK ("tre_thang" BETWEEN 0 AND 36);

-- Mã BIN ngân hàng đúng 6 số — chuỗi VietQR sai BIN thì quét ra tài khoản khác
ALTER TABLE "tai_khoan"
  ADD CONSTRAINT "chk_tai_khoan_bin" CHECK ("bin" ~ '^[0-9]{6}$'),
  ADD CONSTRAINT "chk_tai_khoan_so" CHECK (length(btrim("so_tai_khoan")) > 0);

-- --------------------------------------------------------------------------
--  2. CÂY TỔ CHỨC ĐÚNG BA CẤP (LOGIC.md §4)
--
--  Phòng → Nhóm → cán bộ. Không có tầng thứ tư. Đây là khác biệt bản chất với
--  đa cấp: thù lao TN/TP gắn với PHẠM VI PHỤ TRÁCH, không gắn với số tầng dưới,
--  nên cây sâu thêm một tầng là đổi hẳn bản chất cơ chế.
-- --------------------------------------------------------------------------
ALTER TABLE "don_vi"
  ADD CONSTRAINT "chk_don_vi_cap_cha" CHECK (
    ("cap" = 'PHONG' AND "cha_id" IS NULL) OR ("cap" = 'NHOM' AND "cha_id" IS NOT NULL)
  );

CREATE OR REPLACE FUNCTION fn_don_vi_chan_tang_4()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  cap_cha "CapDonVi";
BEGIN
  IF NEW."cha_id" IS NOT NULL THEN
    SELECT "cap" INTO cap_cha FROM "don_vi" WHERE "id" = NEW."cha_id";
    IF cap_cha IS NULL THEN
      RAISE EXCEPTION 'Đơn vị cha % không tồn tại', NEW."cha_id";
    END IF;
    IF cap_cha <> 'PHONG' THEN
      RAISE EXCEPTION 'Cây tổ chức chỉ có ba cấp: Phòng → Nhóm → cán bộ. Đơn vị "%" không được treo dưới một Nhóm.', NEW."ten";
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER trg_don_vi_chan_tang_4
BEFORE INSERT OR UPDATE ON "don_vi"
FOR EACH ROW EXECUTE FUNCTION fn_don_vi_chan_tang_4();

-- Vai trò phải khớp cấp đơn vị: NV/TN ở Nhóm, TP/ADMIN ở Phòng
CREATE OR REPLACE FUNCTION fn_nhan_su_khop_cap()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  cap_dv "CapDonVi";
BEGIN
  SELECT "cap" INTO cap_dv FROM "don_vi" WHERE "id" = NEW."don_vi_id";
  IF NEW."vai_tro" IN ('NV', 'TN') AND cap_dv <> 'NHOM' THEN
    RAISE EXCEPTION 'Cán bộ và trưởng nhóm phải thuộc một Nhóm, không treo trực tiếp vào Phòng (%)', NEW."ma";
  END IF;
  IF NEW."vai_tro" IN ('TP', 'ADMIN') AND cap_dv <> 'PHONG' THEN
    RAISE EXCEPTION 'Trưởng phòng và quản trị phải thuộc cấp Phòng (%)', NEW."ma";
  END IF;
  RETURN NEW;
END;
$fn$;

CREATE TRIGGER trg_nhan_su_khop_cap
BEFORE INSERT OR UPDATE ON "nhan_su"
FOR EACH ROW EXECUTE FUNCTION fn_nhan_su_khop_cap();

-- --------------------------------------------------------------------------
--  3. BẢNG THAM SỐ CỘNG ĐÚNG 100%
--
--  Cơ cấu quỹ chi và trọng số đầu việc đều phải cộng đúng 1.000.000 ppm cho
--  TỪNG MỐC HIỆU LỰC. Dùng CONSTRAINT TRIGGER hoãn tới cuối giao dịch, để ban
--  hành cả bảng bảy khoản trong một transaction vẫn được — chỉ trạng thái cuối
--  cùng bị soát, không soát từng dòng giữa đường.
-- --------------------------------------------------------------------------
ALTER TABLE "co_cau_quy_chi"
  ADD CONSTRAINT "chk_co_cau_ppm" CHECK ("ppm" BETWEEN 0 AND 1000000),
  ADD CONSTRAINT "chk_co_cau_khoang" CHECK ("hieu_luc_den" IS NULL OR "hieu_luc_den" > "hieu_luc_tu");

CREATE OR REPLACE FUNCTION fn_co_cau_tong_100()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  moc DATE;
  tong INTEGER;
BEGIN
  FOR moc IN SELECT DISTINCT "hieu_luc_tu" FROM "co_cau_quy_chi" LOOP
    SELECT COALESCE(SUM("ppm"), 0) INTO tong FROM "co_cau_quy_chi" WHERE "hieu_luc_tu" = moc;
    IF tong <> 1000000 THEN
      RAISE EXCEPTION 'Cơ cấu quỹ chi mốc % cộng % ppm, phải đúng 1.000.000 (100%%)', moc, tong;
    END IF;
  END LOOP;
  RETURN NULL;
END;
$fn$;

CREATE CONSTRAINT TRIGGER trg_co_cau_tong_100
AFTER INSERT OR UPDATE OR DELETE ON "co_cau_quy_chi"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_co_cau_tong_100();

ALTER TABLE "dau_viec"
  ADD CONSTRAINT "chk_dau_viec_ppm" CHECK ("trong_so_ppm" BETWEEN 0 AND 1000000),
  ADD CONSTRAINT "chk_dau_viec_khoang" CHECK ("hieu_luc_den" IS NULL OR "hieu_luc_den" > "hieu_luc_tu");

CREATE OR REPLACE FUNCTION fn_dau_viec_tong_100()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  moc DATE;
  tong INTEGER;
BEGIN
  FOR moc IN SELECT DISTINCT "hieu_luc_tu" FROM "dau_viec" LOOP
    SELECT COALESCE(SUM("trong_so_ppm"), 0) INTO tong FROM "dau_viec" WHERE "hieu_luc_tu" = moc;
    IF tong <> 1000000 THEN
      RAISE EXCEPTION 'Trọng số đầu việc mốc % cộng % ppm, phải đúng 1.000.000 (1,00)', moc, tong;
    END IF;
  END LOOP;
  RETURN NULL;
END;
$fn$;

CREATE CONSTRAINT TRIGGER trg_dau_viec_tong_100
AFTER INSERT OR UPDATE OR DELETE ON "dau_viec"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_dau_viec_tong_100();

ALTER TABLE "quy_tac_tinh_tien"
  ADD CONSTRAINT "chk_quy_tac_khoang" CHECK ("hieu_luc_den" IS NULL OR "hieu_luc_den" > "hieu_luc_tu"),
  ADD CONSTRAINT "chk_quy_tac_tran" CHECK ("tran_ppm" IS NULL OR "tran_ppm" BETWEEN 0 AND 1000000),
  -- Khai ba chiều phải đủ chiều: tỷ lệ cố định cần gia_tri_ppm, số tiền cần so_tien
  ADD CONSTRAINT "chk_quy_tac_du_chieu" CHECK (
    ("loai_gia_tri" = 'SO_TIEN' AND "so_tien" IS NOT NULL)
    OR (
      "loai_gia_tri" = 'TY_LE'
      AND ("cach_xac_dinh" <> 'CO_DINH' OR "gia_tri_ppm" IS NOT NULL)
    )
  );

ALTER TABLE "tham_so_co_che"
  ADD CONSTRAINT "chk_co_che_muc_san" CHECK ("muc_san" > 0),
  ADD CONSTRAINT "chk_co_che_chi_tieu" CHECK ("chi_tieu_ho_so" >= 0),
  ADD CONSTRAINT "chk_co_che_khoang" CHECK ("hieu_luc_den" IS NULL OR "hieu_luc_den" > "hieu_luc_tu");

ALTER TABLE "thuong_nguong"
  ADD CONSTRAINT "chk_thuong_nguong" CHECK ("nguong_tu" >= 0 AND "so_tien" >= 0);

ALTER TABLE "bieu_luy_tien_bac"
  ADD CONSTRAINT "chk_bac_gia_tri" CHECK ("nguong_tu" >= 0 AND "ppm" >= 0);

ALTER TABLE "quy_tac_bac"
  ADD CONSTRAINT "chk_quy_tac_bac_gia_tri" CHECK ("nguong_tu" >= 0 AND "ppm" >= 0);

-- --------------------------------------------------------------------------
--  4. LẦN THU — chứng từ bắt buộc, không thu quá số kỳ, và KHÔNG LẬP QUỸ CHI
--     TỪ ĐỢT ĐỐI SOÁT CHƯA NHẬN TIỀN (LOGIC.md §2.4)
--
--  Hai đồng hồ lệch nhau: doanh số ghi nhận lúc học viên đóng tiền, quỹ chi chỉ
--  sinh ra khi đối tác chuyển tiền thật về Trường, 4–6 tháng sau. Đặt
--  `DA_NHAN_TIEN` cho lần thu khi đợt còn `CHUA_NHAN_TIEN` là chi tiền chưa có.
-- --------------------------------------------------------------------------
ALTER TABLE "lan_thu"
  ADD CONSTRAINT "chk_lan_thu_chung_tu" CHECK (length(btrim("so_chung_tu")) > 0),
  ADD CONSTRAINT "chk_lan_thu_so_tien" CHECK ("so_tien" > 0),
  ADD CONSTRAINT "chk_lan_thu_ky" CHECK ("ky_thu" >= 1);

CREATE OR REPLACE FUNCTION fn_lan_thu_soat()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  so_ky_ct INTEGER;
  tt_dot "TrangThaiDot";
BEGIN
  SELECT ct."so_ky" INTO so_ky_ct
  FROM "ho_so" h JOIN "chuong_trinh" ct ON ct."id" = h."chuong_trinh_id"
  WHERE h."id" = NEW."ho_so_id";

  IF so_ky_ct IS NULL THEN
    RAISE EXCEPTION 'Hồ sơ % không tồn tại', NEW."ho_so_id";
  END IF;

  IF NEW."ky_thu" > so_ky_ct THEN
    RAISE EXCEPTION 'Kỳ thu % vượt số kỳ của chương trình (%). Học phí toàn khoá đã đóng đủ.', NEW."ky_thu", so_ky_ct;
  END IF;

  IF NEW."trang_thai" = 'DA_NHAN_TIEN' THEN
    IF NEW."dot_doi_soat_id" IS NULL THEN
      RAISE EXCEPTION 'Lần thu % chưa thuộc đợt đối soát nào — không thể ở trạng thái ĐÃ NHẬN TIỀN.', NEW."ma";
    END IF;
    SELECT "trang_thai" INTO tt_dot FROM "dot_doi_soat" WHERE "id" = NEW."dot_doi_soat_id";
    IF tt_dot <> 'DA_NHAN_TIEN' THEN
      RAISE EXCEPTION 'Đợt đối soát chưa nhận tiền — không ai lập quỹ chi từ tiền chưa về (lần thu %).', NEW."ma";
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

CREATE TRIGGER trg_lan_thu_soat
BEFORE INSERT OR UPDATE ON "lan_thu"
FOR EACH ROW EXECUTE FUNCTION fn_lan_thu_soat();

-- `ky_da_thu` của hồ sơ là số dẫn xuất — giữ nó khớp với `lan_thu` ở tầng CSDL
-- thay vì tin vào từng đường ghi. Trạng thái hồ sơ cũng tự chuyển theo.
CREATE OR REPLACE FUNCTION fn_ho_so_dong_bo_ky()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  hs_id UUID := COALESCE(NEW."ho_so_id", OLD."ho_so_id");
  so_da_thu INTEGER;
  so_ky_ct INTEGER;
BEGIN
  SELECT COUNT(*) INTO so_da_thu FROM "lan_thu" WHERE "ho_so_id" = hs_id;
  SELECT ct."so_ky" INTO so_ky_ct
  FROM "ho_so" h JOIN "chuong_trinh" ct ON ct."id" = h."chuong_trinh_id"
  WHERE h."id" = hs_id;

  UPDATE "ho_so"
  SET "ky_da_thu" = so_da_thu,
      -- Cast tường minh: CASE trả về text, cột là enum "TrangThaiHoSo"
      "trang_thai" = (CASE
        WHEN "trang_thai" = 'THOI_HOC' THEN 'THOI_HOC'
        WHEN so_da_thu = 0 THEN 'CHO_THANH_TOAN'
        WHEN so_da_thu >= so_ky_ct THEN 'DA_DU_HOC_PHI'
        ELSE 'DANG_HOC'
      END)::"TrangThaiHoSo"
  WHERE "id" = hs_id;

  RETURN NULL;
END;
$fn$;

CREATE TRIGGER trg_ho_so_dong_bo_ky
AFTER INSERT OR UPDATE OR DELETE ON "lan_thu"
FOR EACH ROW EXECUTE FUNCTION fn_ho_so_dong_bo_ky();

-- Khi đợt được đánh dấu đã nhận tiền, mọi lần thu trong đợt chuyển theo. Đây là
-- mốc DUY NHẤT quỹ chi được sinh ra, nên để CSDL làm, không để mỗi client tự làm.
CREATE OR REPLACE FUNCTION fn_dot_lan_toa_nhan_tien()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  IF NEW."trang_thai" = 'DA_NHAN_TIEN' AND OLD."trang_thai" <> 'DA_NHAN_TIEN' THEN
    IF NEW."ngay_nhan_tien" IS NULL THEN
      RAISE EXCEPTION 'Đợt % đánh dấu đã nhận tiền thì phải có ngày nhận tiền.', NEW."ma";
    END IF;
    UPDATE "lan_thu" SET "trang_thai" = 'DA_NHAN_TIEN' WHERE "dot_doi_soat_id" = NEW."id";
  END IF;
  RETURN NULL;
END;
$fn$;

CREATE TRIGGER trg_dot_lan_toa_nhan_tien
AFTER UPDATE ON "dot_doi_soat"
FOR EACH ROW EXECUTE FUNCTION fn_dot_lan_toa_nhan_tien();

ALTER TABLE "dot_doi_soat"
  ADD CONSTRAINT "chk_dot_ngay_nhan" CHECK (
    ("trang_thai" = 'DA_NHAN_TIEN' AND "ngay_nhan_tien" IS NOT NULL)
    OR ("trang_thai" = 'CHUA_NHAN_TIEN' AND "ngay_nhan_tien" IS NULL)
  );

-- --------------------------------------------------------------------------
--  5. KỲ LƯƠNG ĐÃ CHỐT LÀ BẤT BIẾN (LOGIC.md §9)
--
--  Sai sót đi qua bút toán điều chỉnh ở kỳ sau, không sửa ngược vào kỳ đã trả.
--  Vượt trần chi CHẶN chốt kỳ — không phải chỉ cảnh báo (LOGIC.md §3.2).
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_ky_luong_bat_bien()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."trang_thai" = 'DA_CHOT' THEN
      RAISE EXCEPTION 'Kỳ lương % đã chốt — không xoá được. Kỳ đã chốt là bất biến.', OLD."thang";
    END IF;
    RETURN OLD;
  END IF;

  IF OLD."trang_thai" = 'DA_CHOT' THEN
    RAISE EXCEPTION 'Kỳ lương % đã chốt — bất biến. Sai sót đi qua bút toán điều chỉnh ở kỳ sau.', OLD."thang";
  END IF;

  IF NEW."trang_thai" = 'DA_CHOT' THEN
    IF NEW."vuot_tran" THEN
      RAISE EXCEPTION 'Vượt trần chi — không chốt được kỳ %. Sửa cơ cấu hoặc quy tắc trước.', NEW."thang";
    END IF;
    IF NEW."ngay_chot" IS NULL THEN
      RAISE EXCEPTION 'Chốt kỳ % thì phải có ngày chốt.', NEW."thang";
    END IF;
  END IF;

  RETURN NEW;
END;
$fn$;

CREATE TRIGGER trg_ky_luong_bat_bien
BEFORE UPDATE OR DELETE ON "ky_luong"
FOR EACH ROW EXECUTE FUNCTION fn_ky_luong_bat_bien();

ALTER TABLE "ky_luong"
  ADD CONSTRAINT "chk_ky_luong_thang" CHECK ("thang" ~ '^[0-9]{4}-[0-9]{2}$');

-- Dòng bảng lương của kỳ đã chốt cũng bất biến — nếu không, sửa dòng là sửa kỳ.
CREATE OR REPLACE FUNCTION fn_bang_luong_theo_ky()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$
DECLARE
  tt "TrangThaiKyLuong";
  ky_id UUID := COALESCE(NEW."ky_luong_id", OLD."ky_luong_id");
BEGIN
  SELECT "trang_thai" INTO tt FROM "ky_luong" WHERE "id" = ky_id;
  -- Kỳ không còn tồn tại: đang xoá cả kỳ (kỳ mở), để cascade chạy
  IF tt IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF tt = 'DA_CHOT' THEN
    RAISE EXCEPTION 'Bảng lương của kỳ đã chốt không sửa được.';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$fn$;

CREATE TRIGGER trg_bang_luong_theo_ky
BEFORE INSERT OR UPDATE OR DELETE ON "bang_luong_dong"
FOR EACH ROW EXECUTE FUNCTION fn_bang_luong_theo_ky();
