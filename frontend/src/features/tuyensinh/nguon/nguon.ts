/**
 * Chọn nguồn dữ liệu của module.
 *
 *   demo  — kho trong trình duyệt (localStorage), tự tính mọi con số bằng
 *           `engine/`. Chạy được mà không cần máy chủ, dùng để xem và sửa
 *           nghiệp vụ.
 *   api   — gọi backend. MÁY CHỦ tính tiền, frontend chỉ hiển thị. Đây là
 *           nguồn dùng khi chạy thật: client sửa được, nên client không được
 *           là nơi quyết định số tiền (thuchien.md §11).
 *
 * Bật bằng biến môi trường, không phải sửa mã:
 *
 *   VITE_TUYENSINH_NGUON=api
 *   VITE_TUYENSINH_TIEN_TO=/tuyensinh     # nếu backend mount ở đường khác
 */
export type TenNguon = 'demo' | 'api';

export const NGUON: TenNguon = import.meta.env.VITE_TUYENSINH_NGUON === 'api' ? 'api' : 'demo';

export const laApi = NGUON === 'api';
