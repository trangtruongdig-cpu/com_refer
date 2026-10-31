import { Link } from 'react-router-dom';

const mucDanhMuc = [
  { ten: 'Chương trình', to: '/tuyensinh' },
  { ten: 'Mạng lưới trường', to: '/tuyensinh/doi-tac-tham-khao' },
] as const;

export function BoChuyenDanhMuc({ dangChon }: { dangChon: 'chuong-trinh' | 'doi-tac' }) {
  return (
    <nav aria-label="Danh mục tham khảo" className="flex w-fit max-w-full gap-1 border-b border-phoenix-line">
      {mucDanhMuc.map((muc, index) => {
        const chon = (dangChon === 'chuong-trinh') === (index === 0);
        return (
          <Link
            key={muc.to}
            to={muc.to}
            aria-current={chon ? 'page' : undefined}
            className={`flex min-h-10 items-center border-b-2 px-3 text-[13px] font-medium transition-colors ${
              chon
                ? 'border-phoenix-purple text-phoenix-purple-700'
                : 'border-transparent text-phoenix-slate hover:text-phoenix-ink'
            }`}
          >
            {muc.ten}
          </Link>
        );
      })}
    </nav>
  );
}
