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

| Đường dẫn | Màn hình | Việc |
|---|---|---|
| `/tuyensinh` | Mạng lưới | Trường đối tác, chương trình, quỹ chi và hệ số từng ngành |
| `/tuyensinh/chuong-trinh/:ma` | Chi tiết chương trình | Kinh tế một kỳ thu, cơ cấu quỹ chi, 11 đầu việc, soát trần, lịch tiền về, điều kiện dự tuyển |
| `/tuyensinh/lap-ho-so` | Lập hồ sơ | Biểu mẫu thí sinh, danh mục giấy tờ theo ngành |
| `/tuyensinh/thu-hoc-phi/:ma` | Thu học phí | Mã VietQR + số tài khoản dạng chữ, xác nhận thu ⇒ ghi nhận doanh số |
| `/tuyensinh/ho-so` | Hồ sơ | Danh sách theo phạm vi phụ trách |
| `/tuyensinh/doanh-so` | Doanh số | Biểu lương mềm, ngưỡng thưởng, sổ công nợ ứng trước theo tháng |
| `/tuyensinh/doi-soat` | Đối soát | Lập đợt, đánh dấu đã nhận tiền ⇒ lập quỹ chi |
| `/tuyensinh/quan-tri` | Quản trị | Bảng lương, kỳ lương, bàn van cơ cấu, soát trần toàn danh mục, tài khoản, giả định |

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

## Khi nối backend

thuchien.md §11 đặt ra một nguyên tắc: **frontend không tính lại tiền.** Bản demo
này buộc phải tính ở trình duyệt vì chưa có máy chủ, nhưng nó không tạo ra bản
chép tay thứ hai: `engine/` là bản TypeScript duy nhất trong kho mã, viết đúng
theo mã mẫu trong thuchien.md §6 và không phụ thuộc React hay DOM.

Thứ tự chuyển:

1. Chuyển nguyên thư mục `engine/` sang `backend/src/engine/` cùng bộ kiểm thử.
2. Dựng lược đồ SQL và các endpoint ở thuchien.md §9.4.
3. Thay `kho/kho.store.ts` và `tinh-toan.ts` bằng lệnh gọi API; màn hình không đổi.
4. Bọc nhánh `/tuyensinh` trong `<ProtectedRoute />` và bỏ bộ chọn người dùng.

Hai quy tắc đang được kho demo chặn, sau này phải là trigger ở cơ sở dữ liệu:
không lập quỹ chi từ đợt đối soát chưa nhận tiền; không sửa kỳ lương đã chốt.

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
