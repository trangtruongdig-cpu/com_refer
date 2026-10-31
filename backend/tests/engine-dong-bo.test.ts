/**
 * Chặn LỆCH giữa hai bản engine tính tiền.
 *
 * Engine sống ở `frontend/src/features/tuyensinh/engine` (bản gốc, có bộ kiểm
 * thử của nó) và được nhân bản sang `backend/src/modules/tuyensinh/engine` để
 * máy chủ tự tính tiền — client không được phép là nơi quyết định số tiền, vì
 * client sửa được.
 *
 * Nhân bản mã tính tiền là rủi ro thật: hai bản lệch nhau một dòng là bảng lương
 * ra hai số khác nhau mà không ai thấy. Nên thay vì tin vào quy trình, bài kiểm
 * thử này so từng byte và VỠ NGAY khi hai bên khác nhau.
 *
 * Chỉ so MÃ NGUỒN engine. Bộ kiểm thử hành vi (`*.test.ts`) ở lại frontend vì
 * nó phụ thuộc `du-lieu/` — danh mục tĩnh mà backend đã thay bằng bảng CSDL.
 * Backend không kiểm thử lại engine: nó chạy đúng mã đã được kiểm thử, và bài
 * này bảo đảm "đúng mã đó".
 *
 * Đồng bộ lại bằng: `npm run engine:sync` (trong backend).
 *
 * Trong container, thư mục frontend không có trong build context nên bài này tự
 * bỏ qua — nó là lưới chắn cho máy nhà phát triển và CI chạy ở gốc repo.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const BAN_GOC = join(__dirname, '../../frontend/src/features/tuyensinh/engine');
const BAN_SAO = join(__dirname, '../src/modules/tuyensinh/engine');

const coBanGoc = existsSync(BAN_GOC);

describe.skipIf(!coBanGoc)('engine backend phải giống engine frontend từng byte', () => {
  const laMaNguon = (f: string): boolean => f.endsWith('.ts') && !f.endsWith('.test.ts');
  const tep = coBanGoc ? readdirSync(BAN_GOC).filter(laMaNguon).sort() : [];

  it('không thiếu, không thừa tệp nào', () => {
    expect(readdirSync(BAN_SAO).filter(laMaNguon).sort()).toEqual(tep);
  });

  it.each(tep)('%s giống nhau', (ten) => {
    expect(readFileSync(join(BAN_SAO, ten), 'utf8')).toBe(readFileSync(join(BAN_GOC, ten), 'utf8'));
  });
});
