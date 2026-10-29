# LOGIC.md — Nghiệp vụ của hệ thống

Tài liệu giải thích **vì sao** hệ thống tính tiền như vậy. Đọc file này trước khi
đọc code; [thuchien.md](thuchien.md) nói *làm thế nào*, file này nói *tại sao*.

Viết cho cả người lập trình mới và người phụ trách nghiệp vụ. Mọi con số trong
đây đều lấy từ hệ thống đang chạy, không phải ví dụ bịa — kiểm lại được bằng
`python3 cli.py soat`, `cli.py luongnv DHCNVT-NNA`, `cli.py ungtruoc DHCNVT-NNA`.

---

## 0. Tóm tắt trong một đoạn

Trường Trung cấp Quốc tế Phoenix tuyển sinh cho các chương trình **liên kết đào
tạo**: trường đối tác đào tạo và cấp bằng, Phoenix tìm người học. Đối tác trích
lại cho Phoenix **tối đa 30% học phí**. Phoenix trừ thuế và định mức giữ lại, số
còn lại gọi là **quỹ chi** — và toàn bộ tiền trả cho cán bộ tuyển sinh chỉ được
lấy từ quỹ chi đó. Vì đối tác chỉ đối soát 4–6 tháng một lần, Phoenix **ứng
trước** tiền cho cán bộ rồi thu hồi dần khi tiền thật về.

Ba câu không được quên:

1. **Hoa hồng không bao giờ là phần trăm học phí.** Luôn là phần trăm quỹ chi.
2. **Học viên đóng tiền ≠ Trường có tiền.** Hai mốc cách nhau 4–6 tháng.
3. **Ứng trước là khoản phải thu, không phải chi phí.** Nó tự tất toán.

---

## 1. Phoenix bán cái gì

Sáu hệ sản phẩm, khác nhau về thời lượng, học phí và tỷ lệ trích:

| Hệ | Mã | Số kỳ | Học phí một kỳ | Đối tác trích | Ai cấp bằng |
|---|---|---|---|---|---|
| Chứng chỉ | `CC-*` | 1 | 1.500.000đ | 100% | Phoenix |
| Ngắn hạn | `NH-*` | 1 | 2.000.000đ | 100% | Phoenix |
| Sơ cấp | `SC-*` | 1 | 4.000.000đ | 100% | Phoenix |
| Trung cấp | `TC-*` | 4 | 7.000.000đ | 100% | Phoenix |
| Cao đẳng | `CD-*` | 3 | 9.000.000đ | **30%** | Đối tác |
| Đại học | `DH-*`, `DHCNVT-*` | 4 | 10–11.000.000đ | **25–30%** | Đối tác |

"Trích 100%" nghĩa là sản phẩm của chính Phoenix — toàn bộ học phí vào Trường.
Hệ **cao đẳng và đại học là liên kết**: học phí thuộc đối tác, Phoenix chỉ nhận
phần trích lại.

**Đây là lý do mọi phép tính phải đi qua quỹ chi.** Một chương trình đại học học
phí 44 triệu cả khoá nghe rất lớn, nhưng Phoenix chỉ thực nhận 11,2 triệu. Tính
hoa hồng theo phần trăm học phí là chi nhiều hơn số tiền thật có.

---

## 2. Dòng tiền

### 2.1 Chiều của dòng tiền — chỗ dễ hiểu ngược nhất

Phoenix **không** nộp tiền cho đối tác rồi lấy phần trăm. Chiều đúng là:

> Học viên nộp học phí → **đối tác trích lại** cho Phoenix tối đa 30%, **trước
> thuế** → Phoenix mới phân phối xuống cán bộ.

Điều kiện kèm theo, ghi trong hợp đồng liên kết: Phoenix phải **chăm sóc học viên
cho đến khi học hết khoá**, và **học đến kỳ nào thanh toán kỳ đó**. Hệ quả nghiệp
vụ: tiền về theo từng kỳ, không về một lần, và học viên bỏ học giữa khoá thì
Phoenix mất phần còn lại.

### 2.2 Sơ đồ, lấy số thật của Đại học Công nghiệp Việt Trì ngành Ngôn ngữ Anh

Chương trình 18 tháng, 4 kỳ, học phí 11.000.000đ mỗi kỳ.

```
            HỌC VIÊN nộp học phí một kỳ            11.000.000đ
                        │
                        ▼
            ĐỐI TÁC giữ 70%                         7.700.000đ
                        │ trích về Phoenix 30%
                        ▼
            PHOENIX nhận                            3.300.000đ   ◄── van 1: TỶ LỆ TRÍCH
                        │
                        ├─ thuế                             0đ   ◄── van 2 (chờ kế toán)
                        └─ định mức Trường giữ lại    500.000đ   ◄── van 3
                        │
                        ▼
            ╔═══════════════════════════════════════════════╗
            ║  QUỸ CHI MỘT KỲ            2.800.000đ         ║  = 25,5% học phí
            ╚═══════════════════════════════════════════════╝
                        │
        ┌───────────────┼──────────────┬──────────────┬─────────────┐
        ▼               ▼              ▼              ▼             ▼
  Khoản mạng lưới   Thù lao TP     Thù lao TN    Đối ngoại    Marketing
      60,0%           10,4%           9,6%          5,0%      + Quảng cáo
   1.680.000đ        291.200đ       268.800đ      140.000đ    + Sự kiện
        │                                                       3 × 5,0%
        │ chia theo 11 đầu việc đã nghiệm thu
        ▼
   CÁN BỘ TUYỂN SINH
```

**Tổng cơ cấu đúng 100%**, không hơn. Thù lao trưởng nhóm và trưởng phòng nằm
**bên trong** quỹ chi, không phải khoản cộng thêm bên ngoài — đây là lỗi đã mắc
ở bản dựng thứ tư và phát hiện khi đối chiếu lại ô B30/D30 của file Excel gốc.

### 2.3 Quỹ chi là biến trung tâm

```
quỹ chi một kỳ = học phí một kỳ × tỷ lệ trích − thuế − định mức giữ lại
```

Ràng buộc ở tầng dữ liệu, không phải quy ước:

```sql
CHECK (quy_chi_moi_ky = tien_trich_moi_ky - thue_moi_ky - dinh_muc_moi_ky)
CHECK (quy_chi_moi_ky > 0)
CHECK (hoc_phi = nop_doi_tac + thue + dinh_muc_dao_tao + quy_chi)
```

Dòng cuối là bất biến bảo toàn: học phí phải chia hết, không thất thoát, không
sinh thêm.

### 2.4 Hai đồng hồ chạy lệch nhau 4–6 tháng

Đây là đặc thù quyết định toàn bộ kiến trúc phần lương.

| | `lan_thu` | `dot_doi_soat` |
|---|---|---|
| Sự kiện | Học viên đóng học phí | Đối tác chuyển tiền về Trường |
| Ghi nhận | **Doanh số** của cán bộ | **Quỹ chi** — tiền thật |
| Thời điểm | Ngay lúc thu | **4–6 tháng sau** |
| Dùng để | Xét ngưỡng, xét chỉ tiêu | Lập quỹ, chi tiền |

Trigger `trg_chan_lap_quy_khi_chua_nhan_tien` chặn ở tầng dữ liệu: **không ai lập
được quỹ chi từ một đợt đối soát chưa nhận tiền.** API không được đi vòng.

Nếu lẫn hai đồng hồ này, bảng lương sẽ chi tiền chưa về. Đó chính là lỗi của bản
thiết kế đầu tiên, và cũng là lý do phải có cơ chế ứng trước ở mục 8.

---

## 3. Cơ cấu quỹ chi — bàn van điều hành

Người điều hành chỉ cần **siết van hoặc mở van**, không sửa code. Bảy khoản,
tổng đúng 100%, hiệu lực từ 2026-01-01:

| Khoản | Tỷ trọng | Nội dung |
|---|---:|---|
| `KHOAN_MANG_LUOI` | **60,0%** | Phần của cán bộ tuyển sinh, chia theo 11 đầu việc |
| `THU_LAO_TP` | 10,4% | Trưởng phòng, chỉ trên học viên của các nhóm mình phụ trách |
| `THU_LAO_TN` | 9,6% | Trưởng nhóm, chỉ trên học viên của nhân sự mình phụ trách |
| `DOI_NGOAI` | 5,0% | Làm việc với sở, trường, địa phương |
| `MARKETING` | 5,0% | Nội dung, website, CRM, hình ảnh thương hiệu |
| `QUANG_CAO` | 5,0% | Quảng cáo trả phí, bảng biển, ấn phẩm |
| `SU_KIEN` | 5,0% | Ngày hội hướng nghiệp, hội nghị tư vấn, lễ trao chứng chỉ |

**Bốn khoản 5% cuối là chi theo hoá đơn, không chi theo đầu người.** Chúng có dự
toán năm riêng. Gộp chúng vào phần trả cho người là lỗi "trộn chi phí cố định vào
quỹ biến đổi" — đã làm vỡ trần một lần, và chính bộ soát trần tự viết bắt được
khoản bội chi 2.520.000đ.

### 3.1 Mười một đầu việc

Khoản mạng lưới 60% **không trả trọn cho một người chỉ vì họ mang hồ sơ về**. Nó
chia theo công việc đã nghiệm thu, tổng trọng số đúng 1,00:

| Mã | Đầu việc | Trọng số |
|---|---|---:|
| `T02` | Tư vấn trực tiếp, giải đáp, định hướng ngành | 0,15 |
| `T01` | Tạo nguồn, tiếp cận phụ huynh – học sinh | 0,12 |
| `T03` | Đối ngoại cơ sở: làm việc với trường phổ thông | 0,10 |
| `T04` | Tổ chức buổi tư vấn, sự kiện tại địa bàn | 0,10 |
| `T07` | Hướng dẫn và kiểm tra hồ sơ đầu vào | 0,10 |
| `T09` | Chốt hồ sơ nhập học | 0,10 |
| `T05` | Quảng cáo tại địa phương | 0,08 |
| `T06` | Nội dung, hình ảnh, chăm sóc kênh online địa phương | 0,08 |
| `T08` | Hướng dẫn nộp học phí vào Trường, theo dõi thu | 0,07 |
| `T10` | Chăm sóc 30 ngày đầu, giữ học viên | 0,06 |
| `T11` | Điều hành địa bàn, báo cáo, đối soát | 0,04 |

Vì sao tách ra: một hồ sơ thường do nhiều người cùng làm. Có đầu việc do bộ phận
marketing của Trường làm, có đầu việc do cán bộ địa bàn làm. Chia theo đầu việc
cho phép **trả đúng người đã làm đúng phần việc**, và trả được cho bộ phận chứ
không chỉ cho cá nhân. Trong dữ liệu, `DongBan(..., nghiem_thu={"T05": "BP:Marketing"})`
nghĩa là đầu việc T05 của hồ sơ đó do bộ phận Marketing nghiệm thu.

### 3.2 Trần chi

Tổng mọi khoản trả ra cho một hồ sơ **không được vượt quỹ chi của hồ sơ đó**.
Kiểm bằng `cli.py soat`, và kết quả hiện tại ở mọi bậc:

| Sản phẩm | Quỹ chi một kỳ | Tổng chi | Còn lại | Tỷ lệ |
|---|---:|---:|---:|---:|
| `TC-DD` (trung cấp) | 1.250.000đ | 1.250.000đ | 0đ | 100% |
| `DHCNVT-NNA` (đại học) | 2.800.000đ | 2.620.000đ | 180.000đ | 94% |
| `DH-DT02-GDMN` | 2.050.000đ | 1.620.000đ | 430.000đ | 79% |

`DHCNVT-NNA` dừng ở 94% vì ngành đó có quy tắc riêng trả cán bộ **số tiền cố định
1.500.000đ** thay vì 60% quỹ chi — xem mục 7.

**Quy tắc vận hành:** soát trần trước khi lưu thay đổi cơ cấu, và **chặn chốt kỳ
lương nếu vượt**, không phải chỉ cảnh báo.

---

## 4. Ba cấp, và vì sao không phải đa cấp

```
            PHÒNG KINH DOANH  (TP)
                    │
        ┌───────────┴───────────┐
      NHÓM A (TN)           NHÓM B (TN)
        │                       │
   ┌────┴────┐             ┌────┴────┐
  NV01     NV02           NV03     NV04
```

**Đúng ba cấp, cố định, chặn bằng ràng buộc trong cơ sở dữ liệu** — không phải
quy ước giữa người với người:

```sql
CHECK ((cap = 'PHONG' AND don_vi_cha_id IS NULL)
    OR (cap = 'NHOM'  AND don_vi_cha_id IS NOT NULL))
```

cộng trigger `trg_don_vi_chan_tang_4` chặn một `NHOM` trực thuộc một `NHOM`.

### Vì sao bắt buộc phải như vậy

Nghị định 40/2018/NĐ-CP cho phép **bán hàng đa cấp với hàng hoá**. Đào tạo là
**dịch vụ**, không thuộc phạm vi được phép. Một cơ chế trả tiền theo số tầng
không giới hạn, hoặc trả vì tuyển thêm người, là dấu hiệu kinh doanh đa cấp trái
phép đối với dịch vụ giáo dục.

Trong quá trình thiết kế có yêu cầu làm **cây nhị phân rót tiền**. Đã **không
làm**, và lý do là như trên: cây nhị phân không giới hạn số tầng chính là cấu
trúc bị cấm. Thay vào đó giữ đúng ba cấp, và thù lao TN/TP nằm trong quỹ chi của
chính học viên mà họ phụ trách.

### Thù lao quản lý gắn với phạm vi phụ trách, không gắn với số người

- `THU_LAO_TN` 9,6%: chỉ trên học viên của **nhân sự mình phụ trách**
- `THU_LAO_TP` 10,4%: chỉ trên học viên của **các nhóm mình phụ trách**

Trưởng nhóm có thêm 10 nhân viên nhưng không có học viên nào nhập học thì không
thêm đồng nào. Đây là khác biệt bản chất với đa cấp.

---

## 5. Đưa mọi sản phẩm về cùng một thang

Vấn đề: một chứng chỉ 1,5 triệu và một khoá đại học 44 triệu không so sánh được
bằng doanh thu. Nhưng phải dùng **chung một biểu lương**, nếu không sẽ có 20 biểu
và không ai kiểm được.

### 5.1 PV — điểm quy đổi

```
PV(sản phẩm) = quỹ chi một kỳ / quỹ chi chuẩn          (quỹ chi chuẩn = 800.000đ)
```

| Sản phẩm | Quỹ chi một kỳ | PV |
|---|---:|---:|
| `NH-CSSD-PTTM` (ngắn hạn) | 800.000đ | 1,000 |
| `TC-DD` (trung cấp) | 1.250.000đ | 1,562 |
| `DH-DT02-GDMN` | 2.050.000đ | 2,562 |
| `DHCNVT-NNA` | 2.800.000đ | 3,500 |

PV đo **giá trị kinh tế mang về cho Trường**, không đo doanh thu. Mốc 800.000đ
neo ở sản phẩm ngắn hạn — chọn một mốc cố định thay vì neo theo bậc, để tránh
định nghĩa vòng tròn giữa PV và bậc.

### 5.2 Hệ số quy đổi doanh số

Biểu lương kế thừa từ file Sapo 2015 viết theo **doanh số hệ trung cấp**. Sản
phẩm liên kết sinh quỹ chi khác trên cùng một đồng doanh số, nên phải quy đổi:

```
hệ số = (quỹ chi một kỳ / học phí một kỳ) / 0,178571428571429
```

với `0,178571428571429 = 1.250.000 / 7.000.000` là tỷ lệ của hệ trung cấp — mốc 1,0.

Viết cách khác, gọn hơn và dễ kiểm hơn:

```
doanh số quy đổi một kỳ = quỹ chi một kỳ × 5,6
```

vì `5,6 = 7.000.000 / 1.250.000`. Nói cách khác, **hệ số quy đổi chỉ là cách diễn
đạt quỹ chi theo đơn vị học phí trung cấp.**

| Sản phẩm | Học phí một kỳ | Quỹ chi một kỳ | Hệ số | Doanh số quy đổi |
|---|---:|---:|---:|---:|
| `TC-DD` | 7.000.000đ | 1.250.000đ | 1,000 | 7.000.000đ |
| `DHCNVT-NNA` | 11.000.000đ | 2.800.000đ | **1,425** | **15.680.000đ** |

Kiểm: `2.800.000 × 5,6 = 15.680.000` ✓ và `1.250.000 × 5,6 = 7.000.000` ✓

Nhờ vậy **một đồng doanh số quy đổi của hệ nào cũng mang về cho Trường đúng bằng
nhau**, nên dùng chung một biểu lương là công bằng.

Dải hệ số hiện tại chạy từ **1,000** đến **2,240**:

| Sản phẩm | Trích | Hệ số | Vì sao |
|---|---:|---:|---|
| `TC-DD` trung cấp | 100% | 1,000 | mốc neo |
| `DH-DT02-GDMN` | 25% | 1,148 | học phí cao bù lại tỷ lệ trích thấp |
| `DHCNVT-NNA` | 30% | 1,425 | |
| `NH-CSSD-PTTM` ngắn hạn | 100% | **2,240** | sản phẩm của chính Trường, học phí thấp nhưng giữ trọn |

Con số 2,240 của hệ ngắn hạn nói lên một điều về chiến lược: **trên mỗi đồng học
phí, sản phẩm của chính Trường sinh quỹ chi gấp hơn hai lần sản phẩm liên kết.**
Hệ liên kết bù lại bằng quy mô học phí tuyệt đối lớn hơn.

---

## 6. Biểu lũy tiến — ngữ nghĩa bậc thang biên

Hạt nhân toán học, kế thừa từ file Excel Sapo 2015 và **đã đối chiếu từng ô
D8..K8**.

> Tỷ lệ gắn với ngưỡng `T` áp dụng cho **khoảng** `[T, T_kế_tiếp)`, **không** áp
> cho toàn bộ giá trị. Tỷ lệ của ngưỡng cuối áp cho mọi phần vượt ngưỡng đó.
> Phần giá trị dưới ngưỡng thấp nhất không được hưởng gì.

```
tiền = Σ (phần giá trị nằm trong khoảng i) × (tỷ lệ của khoảng i)
```

Biểu lương mềm cán bộ tuyển sinh, bản hiệu chỉnh cho hệ liên kết, **hiệu lực từ
2026-07-01**:

| Từ doanh số quy đổi | Tỷ lệ khoảng | Thưởng đạt ngưỡng |
|---:|---:|---:|
| 16.000.000đ | 1,6% | — |
| 25.000.000đ | 2,8% | 150.000đ |
| 35.000.000đ | 3,6% | 300.000đ |
| 50.000.000đ | 4,0% | 400.000đ |
| 70.000.000đ | 4,5% | 800.000đ |
| 100.000.000đ | 5,0% | 1.000.000đ |
| 140.000.000đ | 5,6% | 1.400.000đ |
| 200.000.000đ | 6,2% | 2.000.000đ |

Ví dụ kiểm bằng tay, doanh số quy đổi 35.000.000đ:

```
  khoảng [16.000.000; 25.000.000):   9.000.000 × 1,6%  = 144.000
  khoảng [25.000.000; 35.000.000):  10.000.000 × 2,8%  = 280.000
  ───────────────────────────────────────────────────────────────
  lương mềm                                            = 424.000đ
  + thưởng đạt ngưỡng 35.000.000đ                      = 300.000đ
```

**Hai thứ khác nhau, đừng lẫn:** *tỷ lệ khoảng* tính lũy tiến trên phần doanh số;
*thưởng đạt ngưỡng* là số tiền phẳng trả một lần khi vượt mốc.

### Vì sao biểu này phải hiệu chỉnh

Biểu gốc Sapo 2015 có tỷ lệ cao hơn nhiều (16M:5,6% | 25M:10% | 35M:13% | …), vì
nó viết cho mô hình thương mại nơi toàn bộ doanh thu thuộc công ty. Đặt nguyên
biểu đó vào kinh tế liên kết — nơi Trường chỉ giữ ~25% học phí — thì **chi vượt
quỹ chi**. Bản hiệu lực 2026-07-01 là bản đã co lại cho vừa quỹ. Bản cũ vẫn giữ
trong `bieu_luy_tien` với `hieu_luc_den = 2026-07-01`, không xoá, để tính lại
được các kỳ cũ.

---

## 7. Quy tắc tính tiền — ba chiều

Không hardcode cách tính. Một quy tắc khai ba chiều:

| Chiều | Giá trị có thể |
|---|---|
| **Lấy gì làm cơ sở** | `QUY_CHI` · `HOC_PHI` · `KHONG` (không cần cơ sở) |
| **Giá trị là gì** | `TY_LE` (phần trăm) · `SO_TIEN` (số tuyệt đối) |
| **Lấy giá trị ở đâu** | `CO_DINH` · `LUY_TIEN_THEO_TIEN` · `BAC_THEO_SO_LUONG` |

Phạm vi áp dụng theo thứ tự **cụ thể thắng rộng**: ngành → trường → hệ → mặc định
toàn Trường. Các quy tắc đang hiệu lực:

| Vai trò | Phạm vi | Cơ sở | Cách xác định | Giá trị | Trần |
|---|---|---|---|---|---|
| `NV` | ngành `DHCNVT-NNA` | — | `CO_DINH` | 1.500.000đ | 60% |
| `NV` | trường `DH-DT02` | `HOC_PHI` | `CO_DINH` | 8% | 60% |
| `NV` | hệ `DH` | `QUY_CHI` | `BAC_THEO_SO_LUONG` | 48%→52%→56%→60% theo 0/3/6/11 hồ sơ | 60% |
| `NV` | mặc định | `QUY_CHI` | `CO_DINH` | 60% | — |
| `TN` | mặc định | `QUY_CHI` | `CO_DINH` | 9,6% | — |
| `TP` | mặc định | `QUY_CHI` | `CO_DINH` | 10,4% | — |
| `CTV` | hệ `DH` | `HOC_PHI` | `LUY_TIEN_THEO_TIEN` | 5%→6%→7%→8% | 60% |

**Trần của từng quy tắc là lớp chặn thứ hai**, sau trần tổng của quỹ chi. Quy tắc
`HOC_PHI` × 8% nghe nhỏ nhưng trên học phí đại học có thể vượt quỹ chi — trần 60%
chặn lại. Khi trần chặn, mức thực nhận khác mức ghi trong chính sách, và `cli.py soat`
báo `⚠️ BI_CHAN` để người điều hành biết mà sửa chính sách thay vì để lệch âm thầm.

**Cạm bẫy đã mắc:** quy tắc `% HOC_PHI` ban đầu lấy **học phí toàn khoá** thay vì
một kỳ, sai gấp đúng số kỳ. Mọi cơ sở tính toán đều ở mức **một kỳ thu**.

---

## 8. Cơ chế lương hai phần — hiệu lực 01/07/2026

Đây là phần nghiệp vụ thay đổi nhiều nhất trong quá trình thiết kế. Phiên bản
cuối **không có lương cứng**.

### 8.1 Hai phần

| Phần | Là gì | Điều kiện |
|---|---|---|
| **1. Ứng trước** | 5.000.000đ mỗi tháng | Đạt **3 hồ sơ mới trong tháng** |
| **2. Thực hưởng** | 60% quỹ chi của từng kỳ thu, khi tiền thật về | Học viên **còn theo học** |

Phần 1 **là khoản phải thu, không phải lương cứng.** Nó được thu hồi từ phần 2
của chính những hồ sơ cán bộ đó mang về. Không đạt chỉ tiêu thì không được ứng —
chỉ còn phần 2, tức tiền duy trì học viên còn đang học.

Quyền lợi của cán bộ trên một hồ sơ `DHCNVT-NNA`:

```
quỹ chi một kỳ                    2.800.000đ
phần cán bộ 60%                   1.680.000đ   mỗi kỳ thu
toàn khoá 4 kỳ                    6.720.000đ
```

Nhưng về theo lịch đối soát, không về ngay:

| Kỳ | Tiền về tháng | Quyền lợi | Luỹ kế |
|---:|---:|---:|---:|
| 1 | T+5 | 1.680.000đ | 1.680.000đ |
| 2 | T+10 | 1.680.000đ | 3.360.000đ |
| 3 | T+14 | 1.680.000đ | 5.040.000đ |
| 4 | T+19 | 1.680.000đ | 6.720.000đ |

### 8.2 Sổ công nợ — ba nhánh

Logic đầy đủ, và nó **tự tất toán**:

```
nếu  quyền lợi ≥ mức sàn:                       # tiền về đã đủ sống
         thu hồi   = min(nợ, quyền lợi − mức sàn)
         thực nhận = quyền lợi − thu hồi
         nợ       −= thu hồi
ngược lại nếu đạt chỉ tiêu:                     # chưa có tiền về, nhưng đủ hồ sơ
         thực nhận = mức sàn
         nợ       += mức sàn − quyền lợi
ngược lại:                                      # không đạt: chỉ có tiền duy trì
         thực nhận = quyền lợi
```

Nhánh một là chỗ cơ chế tự khoá: cán bộ **luôn nhận ít nhất mức sàn**, phần vượt
mức sàn thì dùng để trả nợ trước, chỉ khi hết nợ mới nhận trọn.

### 8.3 Số liệu đã kiểm — tuyển đều 3 hồ sơ mỗi tháng, giữ 90% học viên mỗi kỳ

| Tháng | Quyền lợi | Ứng thêm | Thu hồi | Thực nhận | Nợ cuối kỳ |
|---:|---:|---:|---:|---:|---:|
| 0–4 | 0 | 5.000.000 | 0 | 5.000.000 | tăng tới **25.000.000** |
| 5–9 | 5.040.000 | 0 | 40.000 | 5.000.000 | giảm chậm |
| 10–13 | 9.576.000 | 0 | 4.576.000 | 5.000.000 | giảm nhanh |
| **14** | 13.658.400 | 0 | 6.496.000 | 7.162.400 | **0** |
| 15–18 | 13.658.400 | 0 | 0 | 13.658.400 | 0 |
| 19+ | 17.332.560 | 0 | 0 | **17.332.560** | 0 |

Ba kết luận quan trọng:

1. **Nợ đỉnh 25.000.000đ = 5 tháng × 5.000.000đ.** Con số này **bất biến với năng
   suất** — nó chỉ phụ thuộc độ trễ đối soát và mức sàn, không phụ thuộc cán bộ
   làm nhiều hay ít. Nhờ vậy tính được vốn lưu động cần thiết một cách chắc chắn.
2. **Tất toán hết ở T+14.** Tổng đã ứng 25.000.000đ, tổng thu hồi 25.000.000đ.
3. **Cơ chế không thể bội chi.** Tổng chi cho một cán bộ bị chặn cứng bằng tổng
   quyền lợi họ tạo ra. Chỉ còn bài toán **vốn lưu động**, không còn bài toán
   kiểm soát chi.

### 8.4 Khi không đạt chỉ tiêu — hệ quả khắc nghiệt, phải biết trước

Cán bộ làm 2 hồ sơ mỗi tháng trong khi chỉ tiêu là 3:

| Tháng | Thực nhận |
|---|---:|
| T+0 đến T+4 | **0đ** |
| T+5 đến T+9 | 3.360.000đ |
| T+10 trở đi | 6.384.000đ rồi tăng dần |

> Người mới hụt chỉ tiêu ngay tháng đầu sẽ **không có đồng thu nhập nào trong 5
> tháng**, vì chưa có kỳ thu nào được đối soát về. Cơ chế bảo vệ Trường tuyệt đối
> nhưng gần như không tuyển được người mới.
>
> **Cách gỡ đã đề xuất:** hạ chỉ tiêu được ứng xuống **2 hồ sơ trong giai đoạn
> thử việc**. Cán bộ có 5 triệu ngay tháng đầu; đổi lại nợ đỉnh tăng từ 25 lên
> **33,2 triệu** và tất toán ở **T+20** thay vì T+14. Đây là đánh đổi giữa khả
> năng giữ người và vốn lưu động — **cần Hiệu trưởng quyết, chưa chốt.**

Cán bộ **ngừng tuyển vẫn tiếp tục nhận tiền duy trì học viên** từ học viên cũ còn
theo học, cho tới khi khoá của họ kết thúc. Động cơ giữ học viên được cài sẵn
trong cơ chế, không cần quy định thêm.

### 8.5 Vì sao chọn ứng trước thay vì lương cứng

Cùng giả thiết 6 nhân viên, mỗi người 3 hồ sơ mỗi tháng:

| | Lương cứng | **Ứng trước** |
|---|---:|---:|
| Vốn Trường bỏ ra | 722.231.460đ | **150.000.000đ** |
| Có thu hồi được không | Không | **Toàn bộ** |
| Thu nhập cán bộ khi ổn định | 12.733.151đ | **17.332.560đ** |
| Rủi ro bội chi quỹ | Có | **Không** |

Thu nhập cán bộ **cao hơn** ở mô hình ứng trước, vì không còn lương cứng ăn vào
quỹ chi — toàn bộ phần mạng lưới 60% thuộc về cán bộ.

### 8.6 Rủi ro còn hở

Cán bộ nghỉ việc sau 3 tháng đã ứng 15.000.000đ mà quyền lợi chưa về đủ. Cần
**điều khoản hoàn ứng trong hợp đồng lao động**, hoặc chấp nhận coi đó là chi phí
tuyển dụng. Đã viết vào Điều 10 khoản 2 của văn bản cơ chế, nhưng **chưa có quy
định chính thức.**

---

## 9. Kỳ lương

Thứ tự bắt buộc, không đổi:

```
mở kỳ → CHỤP ẢNH THAM SỐ → tính bảng lương → soát trần → chốt → (điều chỉnh kỳ sau)
```

**Chụp ảnh tham số (`snapshot_tham_so`) trước khi tính.** Chính sách sẽ đổi; kỳ
lương đã chạy phải tính lại được y nguyên. Không chụp ảnh thì ba tháng sau không
ai giải thích được con số cũ ở đâu ra.

**Chốt kỳ là bất biến.** Trigger `trg_ky_luong_bat_bien` chặn mọi sửa đổi. Sai sót
đi qua **bút toán điều chỉnh ở kỳ sau** — nguyên tắc kế toán, không phải tuỳ chọn
kỹ thuật. Áp dụng cho cả trường hợp hoàn học phí và thu hồi quyền lợi đã trả.

**Soát trần chặn chốt kỳ**, không phải chỉ cảnh báo.

---

## 10. Hiệu lực theo thời gian

Mọi bảng chính sách đều có `hieu_luc_tu` / `hieu_luc_den`. **Không sửa tại chỗ,
không xoá** — ban hành phiên bản mới bằng cách đóng khoảng cũ và mở khoảng mới.

Hệ quả thiết kế:

- **Khoá nghiệp vụ là `(ma, hieu_luc_tu)`, không phải `ma`.** Đặt `UNIQUE` trên
  cột đơn thì không ban hành được phiên bản mới — lỗi này đã mắc thật với
  `bieu_luy_tien` lúc ban hành cơ chế 01/07/2026.
- **Hai bản hiệu lực chồng lấn là lỗi dữ liệu nghiêm trọng.** `nap_tham_so` sẽ
  im lặng lấy bản nào gặp trước. Chặn bằng `EXCLUDE USING gist` của PostgreSQL.
  Nguy hiểm nhất là `cau_truc_hoc_phi`: chồng lấn một ngành ⇒ toàn bộ tiền của
  ngành đó sai mà không báo lỗi.
- **Một request tính trên đúng một phiên bản chính sách.** Nạp tham số một lần
  đầu request, không truy vấn lại giữa đường.
- Mọi báo cáo đều nhận tham số ngày: `cli.py --ngay 2026-09-15 luongnv ...`

Ví dụ thật đang có hai phiên bản song song trong `bieu_luy_tien`:

```
LUONG_MEM_CB   Lương mềm cán bộ tuyển sinh                       2026-01-01 → 2026-07-01
LUONG_MEM_CB   Lương mềm cán bộ tuyển sinh - hiệu chỉnh liên kết 2026-07-01 → (còn hiệu lực)
```

---

## 11. Những điều cơ chế KHÔNG làm

| Không có | Vì sao |
|---|---|
| Hoa hồng trên hồ sơ của người khác | Dịch vụ giáo dục không được kinh doanh đa cấp — NĐ 40/2018/NĐ-CP |
| Phí gia nhập, mua gói, thẻ thành viên | Dấu hiệu nhận diện đa cấp |
| Thưởng vì tuyển thêm người vào mạng lưới | Chỉ trả cho công việc đã nghiệm thu và học phí đã thực thu |
| Tầng thứ tư | Cây tổ chức đúng ba cấp, chặn bằng ràng buộc dữ liệu |
| Cây nhị phân rót tiền | Cùng lý do trên — xem mục 4 |
| Hoa hồng tính theo % học phí | Hệ liên kết Trường chỉ nhận ~25–30% học phí |
| Lương cứng | Thay bằng ứng trước có thu hồi — xem mục 8.5 |
| Số tài khoản ngân hàng hardcode | Là tham số Trường tự điền. Màn hình thu tiền phải hiện **số tài khoản dạng chữ cạnh mã QR** để người nộp đối chiếu |

---

## 12. Vòng đời một hồ sơ, từ đầu đến cuối

```
 1. Cán bộ chọn chương trình          → đọc danh mục: ngành, số kỳ, học phí, điều kiện dự tuyển
 2. Lập hồ sơ thí sinh                → đính kèm bản scan/ảnh; bản công chứng nộp sau khi nhập học
 3. Thu học phí kỳ 1                  → quét mã QR; GHI NHẬN DOANH SỐ cho NV + TN + TP
                                        ⚠ doanh số ghi nhận ngay, tiền CHƯA về Trường
 4. Học viên nhập học                 → bắt đầu nghiệm thu các đầu việc T01..T11
 5. Mỗi tháng                         → xét 3 hồ sơ ⇒ được ứng 5 triệu (khoản phải thu)
 6. T+5: đối tác đối soát kỳ 1        → tiền thật về ⇒ LẬP QUỸ CHI ⇒ thu hồi dần tiền đã ứng
 7. Kỳ 2, 3, 4                        → lặp lại bước 3 và 6, lệch nhau 4–6 tháng
 8. Học viên bỏ học giữa khoá         → mất phần quỹ chi của các kỳ còn lại
 9. Hoàn học phí                      → bút toán điều chỉnh ở kỳ lương SAU, không sửa kỳ đã chốt
10. Hết khoá                          → tổng quyền lợi một hồ sơ DHCNVT-NNA = 6.720.000đ
```

---

## 13. Từ vựng

| Thuật ngữ | Nghĩa | Nơi lưu |
|---|---|---|
| **Quỹ chi** | Tiền thật Trường có để trả cho tuyển sinh, sau thuế và định mức | `cau_truc_hoc_phi.quy_chi` |
| **Tỷ lệ trích** | Phần trăm học phí đối tác trích về Trường (tối đa 30%) | `cau_truc_hoc_phi` |
| **Định mức giữ lại** | Phần Trường giữ cho chi phí đào tạo, mỗi kỳ | `cau_truc_hoc_phi.dinh_muc_dao_tao` |
| **Lần thu** | Học viên đóng tiền một kỳ ⇒ ghi nhận **doanh số** | `lan_thu` |
| **Đợt đối soát** | Đối tác chuyển tiền về Trường ⇒ lập **quỹ chi** | `dot_doi_soat` |
| **PV** | Điểm quy đổi = quỹ chi một kỳ / 800.000đ | `pv_san_pham` |
| **Hệ số quy đổi** | Đưa doanh số mọi hệ về thang trung cấp | tính từ `cau_truc_hoc_phi` |
| **Doanh số quy đổi** | Học phí × hệ số = quỹ chi × 5,6 | tính |
| **Biểu lũy tiến** | Bậc thang biên trên doanh số quy đổi | `bieu_luy_tien` |
| **Thưởng đạt ngưỡng** | Số tiền phẳng trả khi vượt mốc | `thuong_nguong` |
| **Cơ cấu quỹ chi** | Bảy khoản chia quỹ chi, tổng 100% | `co_cau_quy_chi` |
| **Đầu việc** | 11 phần việc chia khoản mạng lưới 60% | `dau_viec` |
| **Mức sàn** | 5.000.000đ ứng trước mỗi tháng khi đạt chỉ tiêu | tham số cơ chế |
| **Sổ công nợ** | Theo dõi ứng trước và thu hồi của một cán bộ | `ung_truoc` |
| **Trần chi** | Tổng chi không vượt quỹ chi | `tran_chi.kiem_tra` |
| **Chụp ảnh tham số** | Đóng băng chính sách tại thời điểm tính kỳ lương | `snapshot_tham_so` |
| **NV / TN / TP** | Nhân viên kinh doanh / Trưởng nhóm / Trưởng phòng | `phan_cong.vai_tro` |

---

## 14. Những con số đã kiểm chứng, và cách kiểm lại

| Khẳng định | Kiểm bằng |
|---|---|
| Cơ cấu quỹ chi tổng đúng 100% | `cli.py soat` — cột "Còn lại" không âm ở mọi bậc |
| Mọi sản phẩm nằm trong quỹ chi ở cả 8 bậc | `cli.py soat --bac 1..8` |
| `DHCNVT-NNA`: quỹ chi 2.800.000đ = 25,5% học phí | `cli.py luongnv DHCNVT-NNA` |
| Hệ số quy đổi 1,425 ⇒ doanh số 15.680.000đ mỗi kỳ | `cli.py luongnv DHCNVT-NNA` |
| Nợ đỉnh 25.000.000đ, tất toán T+14, thu nhập ổn định 17.332.560đ | `cli.py ungtruoc DHCNVT-NNA` |
| Tổng đã ứng = tổng thu hồi | `cli.py ungtruoc` mục 3 |
| Ngữ nghĩa bậc thang biên khớp ô D8..K8 file Excel gốc | `tests/test_doi_chieu_excel.py` |
| Bất biến "tổng chi bằng quỹ chi" cho mọi sản phẩm × bậc | `tests/` — 133 kiểm thử |
| Engine TypeScript khớp engine Python từng đồng | `cd backend && npm test` |

---

## 15. Những gì vẫn là giả định — đọc trước khi tin con số nào

| # | Tham số | Đang dùng | Trạng thái |
|---|---|---|---|
| 1 | Thuế trên phần đối tác trích về | **0** | Cần kế toán xác nhận: doanh thu dịch vụ hay hoạt động giáo dục |
| 2 | Định mức Trường giữ lại mỗi kỳ | 500.000đ | Giả định |
| 3 | Độ trễ đối soát | 5–6 tháng | Giả định, cần đối chiếu từng hợp đồng |
| 4 | Chỉ tiêu được ứng của thử việc | 3 hồ sơ | **Nên hạ xuống 2** — xem mục 8.4 |
| 5 | Mức sàn ứng trước | 5.000.000đ | Cần Hiệu trưởng duyệt |
| 6 | Vốn lưu động mỗi cán bộ | 25.000.000đ | Điều kiện bắt buộc, cần xác nhận nguồn |
| 7 | Hoàn ứng khi nghỉ việc giữa chừng | chưa có | **Rủi ro hở** — xem mục 8.6 |
| 8 | Học phí và tỷ lệ trích từng ngành | dữ liệu mẫu | Phải nhập số thật theo hợp đồng |

Tên trường đối tác trong dữ liệu mẫu còn là `[điền tên thật]` — `CD-DT01` và
`DH-DT02`. Chỉ `DHCNVT` (Đại học Công nghiệp Việt Trì) là trường thật.

**Mục 1 và 3 ảnh hưởng trực tiếp đến mọi con số tiền trong tài liệu này.** Thuế
khác 0 sẽ làm quỹ chi giảm, và độ trễ đối soát khác 5 tháng sẽ làm nợ đỉnh và
nhu cầu vốn lưu động thay đổi theo tỷ lệ thuận.
