# Quy tắc làm việc bắt buộc — Hoa Hồng Tuyển Sinh

## Trước mọi thay đổi lập trình

1. Đọc toàn bộ `AGENTS.md` này.
2. Đọc toàn bộ `PROJECT_CONTEXT.md`.
3. Đọc tài liệu liên quan trong `docs/` nếu thư mục/tài liệu đó được bổ sung, cùng `LOGIC.md`, `thuchien.md` và README feature khi tác động tuyển sinh.
4. Kiểm tra mã nguồn thực tế, schema/migration và test của module sẽ sửa.
5. Hiểu luồng nghiệp vụ bị tác động trước khi viết code. Không bỏ qua các bước này kể cả với lỗi nhỏ.

## Nguyên tắc thay đổi

- Ưu tiên tái sử dụng code/module hiện có; không tạo module mới khi chức năng đã tồn tại.
- Không tự ý đổi kiến trúc, thư viện, database schema, API contract hay hành vi nghiệp vụ.
- Không tự suy diễn công thức hoa hồng, quy trình tiền hoặc chính sách còn chưa chốt. Dừng và hỏi người dùng nếu lựa chọn ảnh hưởng nghiệp vụ.
- Không đọc/ghi/tiết lộ secret trong `.env`; không thao tác dữ liệu production hay dịch vụ đang chạy nếu chưa được yêu cầu rõ.
- Tiền, tỷ lệ và engine tuyển sinh phải tuân theo quy ước hiện tại: tiền theo đồng, tỷ lệ ppm; không thay bằng float.
- Không đi vòng qua service/repository/Prisma conventions; repository là nơi module gọi Prisma.
- Không thay/suy yếu SQL CHECK, trigger, migration hoặc tính bất biến của kỳ lương nếu chưa đánh giá toàn bộ tác động.
- Engine `frontend/src/features/tuyensinh/engine` và `backend/src/modules/tuyensinh/engine` phải đồng bộ byte-for-byte; dùng cơ chế sync/test hiện có khi sửa engine.
- Không bật nguồn frontend `VITE_TUYENSINH_NGUON=api` cho vận hành thật trước khi contract frontend/backend được kiểm thử và các độ lệch được xử lý.

## Trước khi sửa code

Ghi nhận tối thiểu:

1. File sẽ ảnh hưởng và module phụ thuộc.
2. Tác động database, migration/seed/trigger/index nếu có.
3. Tác động API contract, quyền, trạng thái và các luồng nghiệp vụ liên quan.
4. Test hiện có cần chạy/bổ sung.

## Sau khi sửa code

1. Kiểm tra cú pháp/typecheck/lint phù hợp.
2. Chạy test liên quan; với thay đổi cross-cutting chạy bộ phù hợp của frontend/backend.
3. Kiểm tra luồng nghiệp vụ, phân quyền và trạng thái bị tác động.
4. Cập nhật `PROJECT_CONTEXT.md` và tài liệu liên quan khi kiến trúc, module, database, API, quy tắc nghiệp vụ, cấu hình hoặc vận hành thay đổi.

## Khi yêu cầu chưa rõ

Dừng tại điểm cần quyết định; mô tả các phương án và tác động của từng phương án; chờ người dùng xác nhận trước khi triển khai.
