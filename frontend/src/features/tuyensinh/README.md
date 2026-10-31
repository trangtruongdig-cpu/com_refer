# Phần mềm tuyển sinh liên kết — bản chạy được

Hiện thực nghiệp vụ trong [LOGIC.md](../../../../LOGIC.md) thành phần mềm, với
giao diện tương đương bản dựng thử trên artifact và theme lấy từ repo
[phoenix-skills](https://github.com/khiemnguyendinh/phoenix-skills).

Nguồn `demo` lưu dữ liệu tuyển sinh trong `localStorage`, đủ để xem luồng giao
diện và giả lập nghiệp vụ, chưa phải bản chạy thật. Ở nguồn demo, ứng dụng
không gọi `POST /api/auth/refresh` khi khởi động.

```
npm install
npm run dev     # http://localhost:5173/tuyensinh
npm test        # kiểm thử engine, adapter dữ liệu và thành phần dùng chung
```

## Chín màn hình

| Đường dẫn                     | Màn hình              | Việc                                                                               |
| ----------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `/tuyensinh`                  | Mạng lưới             | Chọn nhóm sản phẩm trước; xem trường, logo và chương trình dạng lưới chip          |
| `/tuyensinh/doi-tac-tham-khao` | Trường tiềm năng       | Danh bạ đầu mối có nguồn công khai; bộ lọc khu vực/hình thức/trạng thái             |
| `/tuyensinh/chuong-trinh/:ma` | Chi tiết chương trình | Thông tin tư vấn hoặc lộ trình vận hành, tùy trạng thái xác minh của sản phẩm      |
| `/tuyensinh/lap-ho-so`        | Lập hồ sơ             | Thông tin bắt buộc của thí sinh và checklist giấy tờ theo chương trình             |
| `/tuyensinh/thu-hoc-phi/:ma`  | Thu học phí           | Mã VietQR + số tài khoản dạng chữ, xác nhận thu ⇒ ghi nhận doanh số                |
| `/tuyensinh/ho-so`            | Hồ sơ                 | Danh sách theo phạm vi phụ trách                                                   |
| `/tuyensinh/doanh-so`         | Doanh số              | Quyền lợi đã tính sau đối soát, khoản chờ đối soát và kết quả ứng/thu hồi          |
| `/tuyensinh/doi-soat`         | Đối soát              | Lập đợt, đánh dấu đã nhận tiền ⇒ lập quỹ chi                                       |
| `/tuyensinh/quan-tri`         | Quản trị              | Bảng lương, kỳ lương, bàn van cơ cấu, soát trần toàn danh mục, tài khoản, giả định |

Bộ chọn người dùng ở góc phải là **công cụ demo**, đứng chỗ của đăng nhập thật.
Đổi người để xem phân quyền NV / TN / TP / admin.

Danh bạ trường tiềm năng tách khỏi danh mục chương trình vận hành và các mục tư
vấn bán được. Nguồn công khai về tuyển sinh, từ xa, vừa làm vừa học, văn bằng
hai, liên thông hoặc chứng chỉ chỉ là tín hiệu để Sale khảo sát; không chứng
minh trường đang tìm đối tác hoặc đã ký với Phoenix. Bản ghi này không có học
phí hay hoa hồng, không dùng để lập hồ sơ/thu tiền và không đi vào engine.
Danh sách có thể gồm cả đợt đã đóng; cần xem ghi chú và nguồn trước khi liên hệ.

Tại ngày 31/10/2026, danh bạ có 148 mã tham khảo. Danh sách gồm trường thuộc
hai đại học vùng, các trường thành viên, đại học địa phương và đầu mối có dấu
hiệu tuyển sinh/đào tạo linh hoạt trên nguồn chính thức. Có 24 bản ghi trường
thành viên hiện mới xác nhận được danh tính từ roster; hình thức đào tạo để
trống thay vì suy diễn. Đây vẫn không phải danh sách đã bao phủ toàn bộ đại học
toàn quốc, cũng không xác nhận trường đang tìm Phoenix hoặc đã ký hợp tác.

20 đầu mối mới gồm HNMU, THANHDONG, BAFU, VNUF, VHB, TUETECH, UNETI, UTT,
QUI, DAINAM, HUBT, UFM, TDU, NDUN, AJC, HAU, MIT, BDU, UPT và TNU-FL. Các
nguồn có cohort đã đóng hoặc chưa đọc rõ hạn được ghi chú để Sale không hiểu
thành đang nhận hồ sơ; ví dụ BAFU và NDUN đã qua đợt công bố, còn HNMU/UTT cần
xác nhận ngành và chỉ tiêu trước khi tư vấn. Đây là tín hiệu để khảo sát, không
phải bằng chứng trường đang tìm Phoenix. TNU-FL có nguồn riêng xác nhận hình
thức từ xa/VB2; không suy rộng cho mọi đơn vị thành viên TNU.

20 đầu mối được bổ sung tiếp gồm VUI, TLU, HUNRE, HANU, SKDA, HICT, SDU,
HPMU, NAU, TBUMP, LTVU, UTH, HSU, HIU, GDU, HUST, EPU, VMU, VUTED và UTEHY.
Nguồn gồm thông báo tuyển sinh chính thức về đào tạo thường xuyên, từ xa,
VLVH, liên thông hoặc văn bằng hai. Có cohort đã đóng, lịch chưa rõ và lộ trình
chuyên ngành sức khỏe; ghi chú từng trường giới hạn phạm vi và yêu cầu Sale
xác nhận đợt/ngành/chỉ tiêu. Hoa Sen có lịch nhận đến 28/12/2026 theo thông
báo đợt 3; Thủy lợi và Sân khấu - Điện ảnh đã công bố cohort tương ứng đã qua.
Mọi bản ghi vẫn là tiềm năng, không chứng minh nhu cầu hay thỏa thuận với
Phoenix.

Một số thông báo 2026 từ đợt trước đã hết hạn như VNUA (31/07), USSH (31/08),
ULIS (20/08), SP2 (16/10) và SGU (30/10); mục Tân Tạo nêu hạn 05/11/2026 nhưng
Sale cần xác nhận chỉ tiêu/ngành trước khi giới thiệu. Nguồn Đại học Thủ Dầu
Một ngày 27/10 thay thông báo trước đó; lịch mới nằm trong PDF đính kèm nên chưa
gắn nhãn còn nhận. Với TDMU, USSH, ULIS, HCMUS và HCM-UTE, nguồn/hình thức/tên đã
được cập nhật trong mẫu và seed, nhưng bản ghi cũ trong database không tự đổi:
admin cần cập nhật tại màn Quản trị nếu muốn dữ liệu API theo nguồn mới. Tương
tự, mục HVTC dùng thông báo VB2/VLVH mới hơn trong mẫu; nếu đã có bản ghi DB,
admin cần cập nhật vì seed chỉ bỏ qua mã trùng.

Các nguồn 2024/2025 được ghi rõ là bằng chứng lịch sử, không phải đợt hiện hành.
Đại học Trà Vinh hiện mang tên Đại học Trà Vinh từ ngày 12/01/2026; bản ghi DB
đã tồn tại cũng cần admin sửa tên ở màn Quản trị.

Đọc danh bạ không cần đăng nhập. Quản trị thêm/sửa/lưu trữ/khôi phục yêu cầu
system role `ADMIN`; không dùng vai trò nhân sự tuyển sinh. Lưu trữ giữ lịch sử,
không xóa cứng. Admin có thể ẩn một đầu mối khỏi danh bạ công khai mà vẫn giữ
bản ghi trong danh sách đang hoạt động. Nguồn demo lưu thay đổi ở `localStorage`; API mode dùng
`/api/tuyensinh/doi-tac-tham-khao` và bảng riêng `doi_tac_tham_khao`.
Khởi tạo dữ liệu bằng lệnh tách biệt:

```bash
cd backend
npm run seed:reference
```

Lệnh này không thuộc seed mặc định hoặc bước deploy; `createMany(skipDuplicates)`
không ghi đè trạng thái, ghi chú hay chỉnh sửa của admin.

Danh mục Sale có chương trình vận hành và hai loại mục tư vấn frontend. Chỉ
chương trình vận hành có dữ liệu tiền dùng cho luồng lập hồ sơ, thu học phí và
tính quyền lợi. Mục tư vấn Phoenix và chương trình tư vấn của trường khác chỉ
dùng để Sale tham khảo; không thuộc `ChuongTrinh` backend, không lập hồ sơ, thu
tiền hoặc tính hoa hồng.

Nguồn thông tin Phoenix hiện có mâu thuẫn về số lượng khóa và học phí giữa trang
tổng hợp tuyển sinh, danh sách chương trình và một số trang khóa học riêng.
Vì vậy, các giá trị chưa đối chiếu phải mang trạng thái cần xác nhận và kèm
nguồn; không hiển thị như cam kết tuyển sinh hoặc thông báo thu chính thức.
Trang tổng hợp 2026 nêu 19 khóa ngắn hạn và 26 mô-đun sơ cấp; trang chương
trình và các bài khóa học có danh sách tên khác nhau. Danh mục chỉ đưa vào các
tên có nguồn công khai, các mục chỉ thấy ở thông báo 2025 giữ nhãn tham khảo;
không tự tạo tên để bù số lượng còn thiếu. Trang tổng hợp nêu học phí 2.000.000đ
/module ngắn hạn và 3.500.000đ/sơ cấp, trong khi một số bài khóa ngắn hạn riêng
nêu 2.500.000đ. Lịch chung 2026 ghi ngắn hạn khai giảng thứ 3, sơ cấp thứ 5
hằng tuần; Sale vẫn phải xác nhận khóa cụ thể còn nhận học viên.

Điều kiện công khai 2026 cho ngắn hạn/sơ cấp là từ đủ 15 tuổi và có nhu cầu,
không nêu bằng cấp đầu vào. Checklist sơ cấp có liệt kê học bạ; đó là giấy tờ
cần xác nhận theo khóa, không được suy thành điều kiện bằng cấp. Sale chỉ cần
hỏi thông tin liên hệ, ngày sinh, khóa quan tâm, địa điểm và thời gian có thể
học. Mức “tối đa đến 70%” là nhãn nội bộ dạng văn bản; chưa có cơ sở tính,
đối tượng nhận hoặc mốc đối soát nên không đi vào engine và không hiện số tiền.
Học phí có thể thay đổi theo từng kỳ, nhưng danh mục hiện chưa lưu biểu phí
riêng từng kỳ.

Không đưa sản phẩm tư vấn vào thu học phí, tạo hồ sơ vận hành hoặc tính số tiền
Sale nhận được cho đến khi các dữ liệu và quy tắc liên quan được xác nhận. Số
trong màn hình chương trình vận hành cũng không thay thế thông báo thu của
trường; Doanh số hiện chưa có trạng thái xác nhận chuyển khoản cho Sale.
Chương trình vận hành chưa có `daDoiChieu` được đánh dấu trong lưới/chi tiết là
số liệu chưa đối chiếu và không hiện khoản Sale dự kiến. Nút lập hồ sơ vẫn giữ
nguyên hành vi hiện có; cảnh báo này chưa phải chốt chặn tuyển sinh.

Tại ngày 31/10/2026, mục tư vấn đối tác gồm 63 ngành của 10 trường có thông báo
tuyển sinh 2026: Ngoại thương, Bưu chính Viễn thông, Kinh tế Quốc dân, Công
nghệ Đồng Nai, Thành Đô, Cần Thơ, Đại học Luật ĐHQGHN, HCCT, Thủ Dầu Một và
Tôn Đức Thắng. Từng chương trình có logo trong chip, hình thức học, điều kiện,
thông tin Sale cần hỏi, giấy tờ rà soát, học phí nếu trường công bố, hạn tuyển
và liên kết nguồn. Trạng thái đợt tuyển được tính theo ngày Việt Nam; mục hết
hạn vẫn được giữ với nhãn hết hạn để Sale không tư vấn như đang nhận hồ sơ.

Bộ lọc “Văn bằng 2” gồm cả chương trình được trường gọi chính thức là VB2 và
chương trình đại học từ xa/thường xuyên có thông báo nhận người đã tốt nghiệp
đại học. Cần phân biệt hai trường hợp; đều không đồng nghĩa với tự động miễn
môn hoặc rút ngắn thời gian. Đại học Thương mại chưa có trong danh mục: thông
báo chương trình thứ hai năm 2026 chỉ dành cho sinh viên đang học tại trường,
chưa tìm thấy đợt tuyển phù hợp cho người ngoài.

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
du-lieu/       tham số, chương trình vận hành và danh mục tư vấn frontend
kho/           kho demo bằng zustand + localStorage (sẽ thay bằng API)
tinh-toan.ts   ghép dữ liệu với engine
man-hinh/      chín màn hình
thanh-phan/    thành phần giao diện theo theme Phoenix
```

## Hai nguồn dữ liệu

Màn hình không biết dữ liệu đến từ đâu: chúng gọi hook trong
[`nguon/dung-du-lieu.ts`](nguon/dung-du-lieu.ts). Đổi nguồn là đổi biến môi
trường, không sửa màn hình.

```bash
# mặc định — kho localStorage, tự tính bằng engine/
VITE_TUYENSINH_NGUON=demo

# adapter API thử nghiệm; chưa an toàn để vận hành thật
VITE_TUYENSINH_NGUON=api
VITE_TUYENSINH_TIEN_TO=/tuyensinh   # nếu backend mount ở đường khác
```

| Tệp                        | Việc                                                  |
| -------------------------- | ----------------------------------------------------- |
| `nguon/nguon.ts`           | Cờ chọn nguồn                                         |
| `nguon/dung-du-lieu.ts`    | Hook dữ liệu, hành động và **các hook tính tiền**     |
| `nguon/anh-xa.ts`          | Lớp chống hỏng: đổi hình dạng API sang kiểu nghiệp vụ |
| `src/api/tuyensinh.api.ts` | Lệnh gọi HTTP, tiền tố nằm ở một hằng số              |

Nguyên tắc mong muốn là **máy chủ tính tiền**, nhưng nguồn `api` hiện chưa tuân
thủ đầy đủ: một số hook tổng hợp/bảng lương/sổ công nợ/soát trần quay về tính
cục bộ nếu chưa có dữ liệu API; cơ cấu, tham số cơ chế và kỳ lương cũng còn đọc
từ kho Zustand. Không dùng kết quả fallback đó để vận hành hoặc trả tiền.

Ở nguồn `api`, `/tuyensinh` được bọc `ProtectedRoute` và bộ chọn demo ẩn. Danh
tính tuyển sinh lấy qua `GET /api/tuyensinh/toi-la`; thông tin nhóm/phòng lấy
từ danh sách có phạm vi của `GET /api/tuyensinh/nhan-su`. Bootstrap xác thực chỉ
gọi `POST /api/auth/refresh` ở nguồn `api`.

Hồ sơ gửi metadata tệp trong request tạo hồ sơ, nhưng backend chưa có endpoint
tải nội dung tệp `POST /ho-so/:id/tep`; không thể coi đính kèm ảnh/PDF đã được
lưu lên máy chủ.

**Nguồn `api` chưa được kiểm thử contract end-to-end** và chưa sẵn sàng cho
production. Trước khi bật cần:

1. Kiểm từng request/response với backend.
2. Chuyển các phần còn dùng Zustand/localStorage sang API; endpoint ghi chính
   sách chưa tồn tại thì không được giả vờ lưu thành công.
3. Thay fallback tính cục bộ bằng trạng thái lỗi/chưa tải rõ ràng để tránh hiện
   số demo như thể là số từ máy chủ.
4. Bổ sung upload ở backend trước khi bật tải tệp từ giao diện.
5. Rà soát quyền đọc các endpoint tài khoản nhận tiền, chính sách, đối soát và
   kỳ lương trước khi cho người dùng thật truy cập.

Backend đã có trigger bảo vệ mốc nhận tiền và tính bất biến của kỳ lương; đây
không còn là hạng mục “chuyển từ kho xuống trigger”. Tuy vậy các bảo vệ ở backend
không thay thế việc kiểm thử contract frontend/backend.

Tab Đối soát hiện chỉ hiển thị cho TP/ADMIN, dù backend cho TN lập đợt; TN có thể
không tìm thấy luồng này qua điều hướng giao diện.

Engine tiền đã có bản sao ở `backend/src/modules/tuyensinh/engine`, được
`backend/tests/engine-dong-bo.test.ts` so từng byte với bản gốc ở đây — sửa
engine thì sửa bản gốc rồi đồng bộ lại.

Danh mục tư vấn là dữ liệu frontend, tách khỏi `ChuongTrinh` vận hành của
backend. Hiện không có thay đổi database, migration, API contract hay engine để
lưu hoặc tính tiền cho các sản phẩm tư vấn; `GET /api/tuyensinh/danh-muc` vẫn là
danh mục chương trình vận hành. Chỉ chuyển một mục sang vận hành sau khi thông
tin phí theo kỳ, điều kiện/hồ sơ và chính sách tiền đã được xác minh.

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
5. **Danh mục tuyển sinh Phoenix chưa thống nhất giữa các nguồn.** Số lượng
   khóa và mức phí trên trang tổng hợp, danh sách chương trình và trang khóa học
   riêng có chỗ khác nhau. Giữ các thông tin này ở trạng thái cần xác nhận và
   không coi đó là học phí/đợt tuyển sinh chính thức.
6. **Mức chia hoa hồng “lên tới 70%” chưa đủ căn cứ để đưa vào engine.** Cần
   xác định cơ sở tính, 70% là phần Sale hay toàn bộ quỹ phân phối, và thời điểm
   ghi nhận/đối soát. Theo ví dụ vận hành hiện có `NH-CSSD-PTTM`, học phí
   2.000.000đ tạo quỹ chi 800.000đ; nếu hiểu 70% là 70% học phí gộp thì số
   1.400.000đ vượt quỹ chi hiện tại. Đây chỉ là đối chiếu với cấu hình mẫu,
   không phải kết luận hay quy tắc hoa hồng mới.

Toàn bộ giả định còn lại hiện ngay trong màn Quản trị, mục "Giả định chưa chốt".

## Theme

`src/styles/phoenix-theme.css` là bản copy của
`skills/phoenix-slide-design/assets/templates/colors_and_type.css` trong repo
phoenix-skills, giữ nguyên token màu, gradient, font, thang chữ, bán kính và
bóng đổ; chỉ thu phần mặc định cho `body/h1/h2/h3/p` vào `.phoenix` để không đè
lên các trang shadcn/ui có sẵn. `tailwind.config.ts` và `src/index.css` trỏ về
các biến đó, không viết mã màu trực tiếp. Logo và icon ở `public/brand/`.

Đổi nhận diện: sửa ở repo theme rồi copy lại file CSS, không sửa rải rác.
