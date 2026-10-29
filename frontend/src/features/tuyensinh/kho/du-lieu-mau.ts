/**
 * Dữ liệu mẫu cho bản demo chạy không cần cơ sở dữ liệu.
 *
 * Sinh theo ngày hiện tại để sổ công nợ và lịch đối soát nhìn giống thật: hồ sơ
 * rải sáu tháng gần nhất, lần thu kỳ 1 ngay trong tháng lập, kỳ 2 sau 5 tháng,
 * và chỉ những lần thu đã quá độ trễ đối soát mới được xếp vào đợt ĐÃ NHẬN TIỀN.
 *
 * SỐ TÀI KHOẢN Ở ĐÂY LÀ SỐ GIẢ. Trường tự khai tài khoản thật trong màn Quản trị.
 */
import { CHUONG_TRINH, timChuongTrinh } from '../du-lieu/danh-muc';
import type { DotDoiSoat, HoSo, LanThu, TaiKhoan } from './kho.types';

const hai = (n: number) => String(n).padStart(2, '0');

/** Nhãn tháng `YYYY-MM` của `n` tháng trước `goc`. */
export function thangLui(goc: Date, n: number): string {
  const d = new Date(goc.getFullYear(), goc.getMonth() - n, 1);
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}`;
}

/** Cộng `n` tháng vào nhãn tháng `YYYY-MM`. */
export function thangCong(thang: string, n: number): string {
  const [y, m] = thang.split('-').map(Number);
  const d = new Date(y!, m! - 1 + n, 1);
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}`;
}

/** Số tháng từ `tu` đến `den`, cùng dạng `YYYY-MM`. */
export function soThangGiua(tu: string, den: string): number {
  const [y1, m1] = tu.split('-').map(Number);
  const [y2, m2] = den.split('-').map(Number);
  return (y2! - y1!) * 12 + (m2! - m1!);
}

const ngay = (thang: string, ngayTrongThang: number) => `${thang}-${hai(ngayTrongThang)}`;

interface Mau {
  hoSo: HoSo[];
  lanThu: LanThu[];
  dotDoiSoat: DotDoiSoat[];
  taiKhoan: TaiKhoan[];
}

const TEN_MAU = [
  'Nguyễn Thu Hà',
  'Trần Đức Long',
  'Phạm Thị Mai',
  'Lê Quang Huy',
  'Hoàng Thị Lan',
  'Đỗ Văn Nam',
  'Bùi Thanh Thảo',
  'Ngô Minh Tuấn',
  'Vũ Thị Bích',
  'Đặng Hữu Phước',
  'Trịnh Thuỳ Dương',
  'Mai Văn Sơn',
  'Phan Thị Nhung',
  'Lý Quốc Bảo',
  'Hà Thị Kim',
  'Chu Văn Hiếu',
  'Tạ Thị Yến',
  'Dương Minh Khoa',
  'Lâm Thị Hoa',
  'Võ Trọng Nghĩa',
  'Nguyễn Bá Thắng',
  'Kiều Thị Loan',
  'Trương Văn Đạt',
  'Phùng Thị Ngọc',
  'Cao Đình Khang',
  'Lưu Thị Vân',
];

/** Lịch tuyển của bản demo: ai, tháng nào, mấy hồ sơ, chương trình nào. */
const LICH: { nhanSuId: string; luiThang: number; chuongTrinh: string[] }[] = [
  { nhanSuId: 'NV01', luiThang: 5, chuongTrinh: ['DHCNVT-NNA', 'DHCNVT-NNA', 'DHCNVT-QTKD'] },
  { nhanSuId: 'NV01', luiThang: 4, chuongTrinh: ['DHCNVT-NNA', 'DHCNVT-CNTT', 'DHCNVT-NNA'] },
  { nhanSuId: 'NV01', luiThang: 3, chuongTrinh: ['DHCNVT-NNA', 'DHCNVT-KETOAN', 'DHCNVT-NNA'] },
  { nhanSuId: 'NV01', luiThang: 2, chuongTrinh: ['DHCNVT-NNA', 'DHCNVT-NNA', 'DHCNVT-CNTP'] },
  { nhanSuId: 'NV01', luiThang: 1, chuongTrinh: ['DHCNVT-NNA', 'DHCNVT-QTKD', 'DHCNVT-NNA'] },
  { nhanSuId: 'NV01', luiThang: 0, chuongTrinh: ['DHCNVT-NNA', 'DHCNVT-NNA', 'DHCNVT-CNTT'] },
  { nhanSuId: 'NV02', luiThang: 2, chuongTrinh: ['CD-DT01-DD', 'DH-DT02-GDMN'] },
  { nhanSuId: 'NV02', luiThang: 1, chuongTrinh: ['CD-DT01-DUOC', 'DH-DT02-LUAT'] },
  { nhanSuId: 'NV02', luiThang: 0, chuongTrinh: ['CD-DT01-DD', 'DH-DT02-GDMN'] },
  { nhanSuId: 'NV03', luiThang: 1, chuongTrinh: ['TC-DD'] },
  { nhanSuId: 'NV03', luiThang: 0, chuongTrinh: ['NH-CSSD-PTTM', 'TC-CSSD'] },
];

export function duLieuMau(homNay = new Date()): Mau {
  const thangNay = thangLui(homNay, 0);
  const taiKhoan: TaiKhoan[] = [
    {
      id: 'TK-PHOENIX',
      tenChu: 'TRUONG TRUNG CAP QUOC TE PHOENIX (DEMO)',
      tenNganHang: 'Ngân hàng demo — thay bằng tài khoản thật của Trường',
      bin: '970415',
      soTaiKhoan: '0000001234567',
    },
  ];

  const hoSo: HoSo[] = [];
  const lanThu: LanThu[] = [];
  let soTen = 0;
  let soHs = 0;

  for (const dong of LICH) {
    const thang = thangLui(homNay, dong.luiThang);
    for (const ctMa of dong.chuongTrinh) {
      const ct = timChuongTrinh(ctMa) ?? CHUONG_TRINH[0]!;
      soHs += 1;
      const ma = `HS${thang.replace('-', '').slice(2)}${hai(soHs)}`;
      const hoTen = TEN_MAU[soTen % TEN_MAU.length]!;
      soTen += 1;

      // Kỳ 2 chỉ phát sinh khi hồ sơ đã đủ 5 tháng — học đến kỳ nào đóng kỳ đó
      const kyDaThu = dong.luiThang >= 5 ? Math.min(2, ct.soKy) : 1;
      hoSo.push({
        ma,
        chuongTrinhMa: ct.ma,
        hoTen,
        ngaySinh: `199${soHs % 10}-0${(soHs % 9) + 1}-1${soHs % 9}`,
        soCccd: `0010${String(240000 + soHs * 137).padStart(8, '0')}`,
        dienThoai: `09${String(10000000 + soHs * 918271).slice(0, 8)}`,
        email: '',
        diaChi: 'Hà Nội',
        trinhDo: ct.tuTrinhDo === 'THPT' ? 'Trung học phổ thông' : `Tốt nghiệp ${ct.tuTrinhDo}`,
        noiCongTac: '',
        ghiChu: '',
        nhanSuId: dong.nhanSuId,
        ngayLap: ngay(thang, 5),
        trangThai: 'DANG_HOC',
        tep: [],
        kyDaThu,
      });

      for (let ky = 1; ky <= kyDaThu; ky++) {
        const thangThu = ky === 1 ? thang : thangCong(thang, 5);
        if (soThangGiua(thangThu, thangNay) < 0) continue;
        lanThu.push({
          ma: `LT${ma.slice(2)}K${ky}`,
          hoSoMa: ma,
          kyThu: ky,
          ngayThu: ngay(thangThu, 12),
          soTien: ct.hocPhiKy,
          soChungTu: `UNC-${thangThu.replace('-', '')}-${hai(soHs)}`,
          bienLaiTen: 'bien-lai-demo.jpg',
          taiKhoanId: 'TK-PHOENIX',
          nhanSuId: dong.nhanSuId,
          dotDoiSoatMa: null,
          trangThai: 'CHO_DOI_SOAT',
        });
      }
    }
  }

  // Đợt đối soát: gom theo trường. Chỉ lần thu đã quá độ trễ của trường đó mới
  // được xếp vào đợt ĐÃ NHẬN TIỀN — đúng hai đồng hồ lệch nhau của LOGIC.md §2.4.
  const dotDoiSoat: DotDoiSoat[] = [];
  const theoTruong = new Map<string, LanThu[]>();
  for (const lt of lanThu) {
    const ct = timChuongTrinh(hoSo.find((h) => h.ma === lt.hoSoMa)!.chuongTrinhMa)!;
    const treDu = soThangGiua(lt.ngayThu.slice(0, 7), thangNay) >= ct.treThang;
    if (!treDu) continue;
    const khoa = ct.truongMa;
    if (!theoTruong.has(khoa)) theoTruong.set(khoa, []);
    theoTruong.get(khoa)!.push(lt);
  }

  let soDot = 0;
  for (const [truongMa, ds] of theoTruong) {
    soDot += 1;
    const ct = timChuongTrinh(hoSo.find((h) => h.ma === ds[0]!.hoSoMa)!.chuongTrinhMa)!;
    // Đợt của trường đối tác 02 để nguyên CHƯA NHẬN TIỀN: màn Đối soát phải cho
    // thấy quy tắc "không ai lập quỹ chi từ đợt chưa nhận tiền".
    const daNhan = truongMa !== 'DH-DT02';
    const ma = `DS${thangNay.replace('-', '').slice(2)}${hai(soDot)}`;
    dotDoiSoat.push({
      ma,
      truongMa,
      truongTen: ct.truongTen,
      ngayLap: ngay(thangNay, 10),
      ngayNhanTien: daNhan ? ngay(thangNay, 15) : null,
      trangThai: daNhan ? 'DA_NHAN_TIEN' : 'CHUA_NHAN_TIEN',
      lanThuMa: ds.map((x) => x.ma),
    });
    for (const lt of ds) {
      const i = lanThu.findIndex((x) => x.ma === lt.ma);
      lanThu[i] = {
        ...lt,
        dotDoiSoatMa: ma,
        trangThai: daNhan ? 'DA_NHAN_TIEN' : 'CHO_DOI_SOAT',
      };
    }
  }

  return { hoSo, lanThu, dotDoiSoat, taiKhoan };
}
