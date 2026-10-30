/** Kiểu dữ liệu nghiệp vụ. Tên trường giữ đúng từ vựng của LOGIC.md §13. */

export interface TepDinhKem {
  readonly muc: string;
  readonly ten: string;
}

export type TrangThaiHoSo = 'CHO_THANH_TOAN' | 'DANG_HOC' | 'DA_DU_HOC_PHI' | 'THOI_HOC';

export interface HoSo {
  readonly ma: string;
  /** Khoá chính của máy chủ. Chỉ có khi chạy nguồn `api`; bản demo dùng `ma`. */
  readonly id?: string;
  readonly chuongTrinhMa: string;
  readonly hoTen: string;
  readonly ngaySinh: string;
  readonly soCccd: string;
  readonly dienThoai: string;
  readonly email: string;
  readonly diaChi: string;
  readonly trinhDo: string;
  readonly noiCongTac: string;
  readonly ghiChu: string;
  readonly nhanSuId: string;
  readonly ngayLap: string;
  readonly trangThai: TrangThaiHoSo;
  readonly tep: readonly TepDinhKem[];
  readonly kyDaThu: number;
}

/**
 * LẦN THU — học viên đóng học phí một kỳ. Ghi nhận DOANH SỐ ngay lúc này, nhưng
 * TIỀN CHƯA VỀ TRƯỜNG. Đừng lẫn với đợt đối soát.
 */
export interface LanThu {
  readonly ma: string;
  /** Khoá chính của máy chủ. Chỉ có khi chạy nguồn `api`; bản demo dùng `ma`. */
  readonly id?: string;
  readonly hoSoMa: string;
  readonly kyThu: number;
  readonly ngayThu: string;
  readonly soTien: number;
  /** Bắt buộc — không có chứng từ thì không ghi nhận */
  readonly soChungTu: string;
  readonly bienLaiTen: string | null;
  readonly taiKhoanId: string;
  readonly nhanSuId: string;
  readonly dotDoiSoatMa: string | null;
  /** `DA_NHAN_TIEN` chỉ được đặt khi đợt đối soát đã nhận tiền */
  readonly trangThai: 'CHO_DOI_SOAT' | 'DA_NHAN_TIEN';
}

/**
 * ĐỢT ĐỐI SOÁT — đối tác chuyển tiền về Trường, 4–6 tháng sau lần thu. Chỉ khi
 * `DA_NHAN_TIEN` mới được lập quỹ chi.
 */
export interface DotDoiSoat {
  readonly ma: string;
  /** Khoá chính của máy chủ. Chỉ có khi chạy nguồn `api`; bản demo dùng `ma`. */
  readonly id?: string;
  readonly truongMa: string;
  readonly truongTen: string;
  readonly ngayLap: string;
  readonly ngayNhanTien: string | null;
  readonly trangThai: 'CHUA_NHAN_TIEN' | 'DA_NHAN_TIEN';
  readonly lanThuMa: readonly string[];
}

export interface TaiKhoan {
  readonly id: string;
  readonly tenChu: string;
  readonly tenNganHang: string;
  /** Mã BIN ngân hàng, 6 số. KHÔNG hardcode số tài khoản thật trong mã nguồn */
  readonly bin: string;
  readonly soTaiKhoan: string;
}

export interface DongBangLuong {
  readonly nhanSuId: string;
  readonly hoTen: string;
  readonly nhom: string;
  readonly phong: string;
  readonly soHoSoMoi: number;
  readonly soKyThu: number;
  readonly hocPhiThucThu: number;
  readonly doanhSoQuyDoi: number;
  readonly luongMem: number;
  readonly thuongNguong: number;
  readonly quyenLoi: number;
  readonly ungThem: number;
  readonly thuHoi: number;
  readonly thucNhan: number;
  readonly noCuoiKy: number;
}

/** Kỳ lương đã chốt là BẤT BIẾN. Sai sót đi qua bút toán điều chỉnh ở kỳ sau. */
export interface KyLuong {
  readonly thang: string;
  readonly trangThai: 'MO' | 'DA_CHOT';
  readonly ngayMo: string;
  readonly ngayChot: string | null;
  /** Chụp ảnh tham số trước khi tính — để tính lại được y nguyên sau khi chính sách đổi */
  readonly snapshot: string;
  readonly bang: readonly DongBangLuong[];
  readonly tongThucNhan: number;
  readonly thuLaoTn: number;
  readonly thuLaoTp: number;
  readonly quyChiPhatSinh: number;
  readonly vuotTran: boolean;
}
