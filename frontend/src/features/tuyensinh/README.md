# Phần mềm tuyển sinh liên kết — bản chạy được

Hiện thực nghiệp vụ trong [LOGIC.md](../../../../LOGIC.md) thành phần mềm, với
giao diện tương đương bản dựng thử trên artifact và theme lấy từ repo
[phoenix-skills](https://github.com/khiemnguyendinh/phoenix-skills).

**Bản này chạy hoàn toàn trong trình duyệt**: dữ liệu nằm ở `localStorage`, chưa
gọi API nào. Đủ để xem và sửa nghiệp vụ; chưa phải bản chạy thật.

```
npm install
npm run dev     # http://localhost:5173/tuyensinh
npm test        # 75 kiểm thử, phần lớn là đối chiếu với số trong LOGIC.md
```

## Bảy màn hình

| Đường dẫn                     | Màn hình              | Việc                                                                                         |
| ----------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `/tuyensinh`                  | Mạng lưới             | Trường đối tác, chương trình, quỹ chi và hệ số từng ngành                                    |
| `/tuyensinh/chuong-trinh/:ma` | Chi tiết chương trình | Kinh tế một kỳ thu, cơ cấu quỹ chi, 11 đầu việc, soát trần, lịch tiền về, điều kiện dự tuyển |
| `/tuyensinh/lap-ho-so`        | Lập hồ sơ             | Biểu mẫu thí sinh, danh mục giấy tờ theo ngành                                               |
| `/tuyensinh/thu-hoc-phi/:ma`  | Thu học phí           | Mã VietQR + số tài khoản dạng chữ, xác nhận thu ⇒ ghi nhận doanh số                          |
| `/tuyensinh/ho-so`            | Hồ sơ                 | Danh sách theo phạm vi phụ trách                                                             |
| `/tuyensinh/doanh-so`         | Doanh số              | Biểu lương mềm, ngưỡng thưởng, sổ công nợ ứng trước theo tháng                               |
| `/tuyensinh/doi-soat`         | Đối soát              | Lập đợt, đánh dấu đã nhận tiền ⇒ lập quỹ chi                                                 |
| `/tuyensinh/quan-tri`         | Quản trị              | Bảng lương, kỳ lương, bàn van cơ cấu, soát trần toàn danh mục, tài khoản, giả định           |

Bộ chọn người dùng ở góc phải là **công cụ demo**, đứng chỗ của đăng nhập thật.
Đổi người để xem phân quyền NV / TN / TP / admin.

## Cấu trúc

```
engine/        phép tính tiền — chỗ DUY NHẤT biết làm tròn, lũy tiến, phân bổ, trần
  tien.ts        số học tiền tệ (copy nguyên văn từ thuchien.md §6.2)
  luy-tien.ts    bậc thang biên + thưởng ngưỡng (§6.3)
  quy-chi.ts     quỹ chi, PV, hệ số quy đổi, cơ cấu, đầu việc
  quy-tac.ts     quy tắc ba chiều, cụ thể thắng rộng, trần của quy tắc
  tran-chi.ts    soát trần chi
  ung-truoc.ts   sổ công nợ ba nhánh
  vietqr.ts      chuỗi EMVCo + CRC-16/CCITT-FALSE
du-lieu/       tham số chính sách và danh mục (sẽ đến từ cơ sở dữ liệu)
kho/           kho demo bằng zustand + localStorage (sẽ thay bằng API)
tinh-toan.ts   ghép dữ liệu với engine (sẽ thay bằng lệnh gọi API)
man-hinh/      bảy màn hình
thanh-phan/    thành phần giao diện theo theme Phoenix
```

## Hai nguồn dữ liệu

Màn hình không biết dữ liệu đến từ đâu: chúng gọi hook trong
[`nguon/dung-du-lieu.ts`](nguon/dung-du-lieu.ts). Đổi nguồn là đổi biến môi
trường, không sửa màn hình.

```bash
# mặc định — kho localStorage, tự tính bằng engine/
VITE_TUYENSINH_NGUON=demo

# gọi backend thật; máy chủ tính tiền, frontend chỉ hiển thị
VITE_TUYENSINH_NGUON=api
VITE_TUYENSINH_TIEN_TO=/tuyensinh   # nếu backend mount ở đường khác
```

| Tệp                        | Việc                                                  |
| -------------------------- | ----------------------------------------------------- |
| `nguon/nguon.ts`           | Cờ chọn nguồn                                         |
| `nguon/dung-du-lieu.ts`    | Hook dữ liệu, hành động và **các hook tính tiền**     |
| `nguon/anh-xa.ts`          | Lớp chống hỏng: đổi hình dạng API sang kiểu nghiệp vụ |
| `src/api/tuyensinh.api.ts` | Lệnh gọi HTTP, tiền tố nằm ở một hằng số              |

thuchien.md §11 đặt ra nguyên tắc **frontend không tính lại tiền**. Ở nguồn
`api`, `useTongHopThang`, `useSoCongNo`, `useBangLuong`, `useSoatTran` chỉ nhận
số từ máy chủ; `tinh-toan.ts` chỉ còn chạy ở nguồn `demo`.

Ở nguồn `api` đã có sẵn: bắt buộc đăng nhập (`/tuyensinh` bọc trong
`ProtectedRoute`), danh tính lấy từ phiên qua `GET /nhan-su/toi` và bộ chọn
người dùng demo tự ẩn, tệp đính kèm tải thật qua `POST /ho-so/:id/tep` ngay sau
khi lập hồ sơ.

**Phần `api` chưa chạy đối chiếu với máy chủ thật** — nó viết theo lược đồ Zod
và Prisma của `backend/src/modules/tuyensinh`. Khi backend bật, việc còn lại:

1. Kiểm từng hook ở nguồn `api`, lệch hình dạng thì sửa trong `anh-xa.ts`.
2. Chuyển bàn van cơ cấu, tham số cơ chế và kỳ lương từ kho sang endpoint
   `/tham-so`, `/ky-luong` — hiện vẫn chạy ở kho kể cả nguồn `api`.
3. Bảng soát trần toàn danh mục ở màn Quản trị còn tính cục bộ; đổi sang một
   lượt gọi `/tran-chi` cho cả danh mục.
4. Chuyển hai chốt an toàn từ kho xuống trigger cơ sở dữ liệu: không lập quỹ
   chi từ đợt chưa nhận tiền, không sửa kỳ lương đã chốt (việc của backend).

Engine tiền đã có bản sao ở `backend/src/modules/tuyensinh/engine`, được
`backend/tests/engine-dong-bo.test.ts` so từng byte với bản gốc ở đây — sửa
engine thì sửa bản gốc rồi đồng bộ lại.

## Chỗ tài liệu chưa khớp nhau — cần chốt trước khi chạy thật

1. **Quyền lợi một kỳ của `DHCNVT-NNA`.** LOGIC.md §7 khai quy tắc riêng cho
   ngành này là số tiền cố định **1.500.000đ**; §8.1 và bảng số §8.3 lại tính
   **1.680.000đ** (60% quỹ chi). Phần mềm chạy theo §7 vì đó là bảng quy tắc;
   kiểm thử `ung-truoc.test.ts` dựng lại bảng §8.3 nên dùng 1.680.000đ. Lệch
   180.000đ mỗi kỳ thu.
2. **Ngưỡng tiền của quy tắc cộng tác viên.** §7 chỉ ghi dải tỷ lệ 5%→6%→7%→8%,
   không ghi ngưỡng. Đang tạm dùng 0 / 25 / 50 / 100 triệu doanh số quy đổi.
3. **Biểu lương mềm bản cũ (Sapo 2015).** §6 chỉ ghi lại ba bậc đầu. Bản trong
   `tham-so.ts` vì vậy không đủ để tính lại kỳ lương trước 01/07/2026.
4. **PV in ra theo kiểu cắt ba chữ số**, không làm tròn — để khớp bảng §5.1
   (1,5625 in là `1,562`). Giá trị tính toán vẫn là số đầy đủ.

Toàn bộ giả định còn lại hiện ngay trong màn Quản trị, mục "Giả định chưa chốt".

## Theme

`src/styles/phoenix-theme.css` là bản copy của
`skills/phoenix-slide-design/assets/templates/colors_and_type.css` trong repo
phoenix-skills, giữ nguyên token màu, gradient, font, thang chữ, bán kính và
bóng đổ; chỉ thu phần mặc định cho `body/h1/h2/h3/p` vào `.phoenix` để không đè
lên các trang shadcn/ui có sẵn. `tailwind.config.ts` và `src/index.css` trỏ về
các biến đó, không viết mã màu trực tiếp. Logo và icon ở `public/brand/`.

Đổi nhận diện: sửa ở repo theme rồi copy lại file CSS, không sửa rải rác.
