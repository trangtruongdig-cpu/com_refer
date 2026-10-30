/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** `api` = gọi backend thật, bỏ trống hoặc `demo` = chạy bằng localStorage */
  readonly VITE_TUYENSINH_NGUON?: 'demo' | 'api';
  /** Tiền tố đường dẫn của module tuyển sinh trên backend, sau `/api` */
  readonly VITE_TUYENSINH_TIEN_TO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
