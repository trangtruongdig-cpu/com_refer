import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiSuccess } from '@/types/api';
import { api } from '@/api/client';
import type { DoiTacThamKhao } from '../du-lieu/doi-tac-tham-khao';
import { useKho } from '../kho/kho.store';
import { laApi } from './nguon';

const TIEN_TO = import.meta.env.VITE_TUYENSINH_TIEN_TO ?? '/tuyensinh';
const DUONG_DAN = `${TIEN_TO}/doi-tac-tham-khao`;
const KHOA_QUERY = ['tuyensinh', 'doi-tac-tham-khao'] as const;

type DoiTacGui = Omit<
  DoiTacThamKhao,
  'id' | 'hoatDong' | 'archivedAt' | 'createdAt' | 'updatedAt'
>;

export function locDoiTacCongKhai(doiTac: readonly DoiTacThamKhao[]) {
  return doiTac.filter(
    (muc) => muc.hoatDong !== false && !muc.archivedAt && muc.hienThiCongKhai !== false,
  );
}

function boTruongDoc(doiTac: DoiTacThamKhao): DoiTacGui {
  const { id: _id, hoatDong: _hoatDong, archivedAt: _archivedAt, createdAt: _createdAt, updatedAt: _updatedAt, ...body } =
    doiTac;
  return body;
}

export function useDanhBaDoiTac(choQuanTri = false) {
  const kho = useKho((state) => state.doiTacThamKhao);
  const query = useQuery({
    queryKey: [...KHOA_QUERY, choQuanTri],
    queryFn: async () => {
      const response = await api.get<ApiSuccess<DoiTacThamKhao[]>>(
        choQuanTri ? `${DUONG_DAN}/admin` : DUONG_DAN,
        choQuanTri ? { params: { includeArchived: true } } : undefined,
      );
      return response.data.data;
    },
    enabled: laApi,
    staleTime: 5 * 60_000,
  });
  const danhBa = laApi ? (query.data ?? []) : kho;

  return {
    doiTac: choQuanTri
      ? danhBa
      : locDoiTacCongKhai(danhBa),
    dangTai: laApi && query.isLoading,
    loi: laApi && query.isError,
  };
}

export function useHanhDongDanhBaDoiTac() {
  const qc = useQueryClient();
  const luuDemo = useKho((state) => state.luuDoiTacThamKhao);
  const luuTruDemo = useKho((state) => state.luuTruDoiTacThamKhao);
  const khoiPhucDemo = useKho((state) => state.khoiPhucDoiTacThamKhao);
  const datBao = useKho((state) => state.datBao);

  const lamMoi = async () => {
    await qc.invalidateQueries({ queryKey: KHOA_QUERY });
  };

  return {
    luu: async (doiTac: DoiTacThamKhao): Promise<boolean> => {
      if (!laApi) return luuDemo(doiTac);
      try {
        const body = boTruongDoc(doiTac);
        if (doiTac.id) {
          await api.patch<ApiSuccess<DoiTacThamKhao>>(`${DUONG_DAN}/${doiTac.id}`, body);
        } else {
          await api.post<ApiSuccess<DoiTacThamKhao>>(DUONG_DAN, body);
        }
        await lamMoi();
        datBao({ loai: 'ok', chu: `Đã lưu đầu mối ${doiTac.ten}.` });
        return true;
      } catch {
        datBao({ loai: 'loi', chu: 'Không lưu được đầu mối. Kiểm tra quyền ADMIN và dữ liệu nhập.' });
        return false;
      }
    },
    luuTru: async (doiTac: DoiTacThamKhao): Promise<boolean> => {
      if (!laApi) {
        luuTruDemo(doiTac.ma);
        return true;
      }
      if (!doiTac.id) return false;
      try {
        await api.delete<ApiSuccess<DoiTacThamKhao>>(`${DUONG_DAN}/${doiTac.id}`);
        await lamMoi();
        datBao({ loai: 'ok', chu: 'Đã lưu trữ đầu mối; lịch sử được giữ nguyên.' });
        return true;
      } catch {
        datBao({ loai: 'loi', chu: 'Không lưu trữ được đầu mối.' });
        return false;
      }
    },
    khoiPhuc: async (doiTac: DoiTacThamKhao): Promise<boolean> => {
      if (!laApi) {
        khoiPhucDemo(doiTac.ma);
        return true;
      }
      if (!doiTac.id) return false;
      try {
        await api.post<ApiSuccess<DoiTacThamKhao>>(`${DUONG_DAN}/${doiTac.id}/khoi-phuc`);
        await lamMoi();
        datBao({ loai: 'ok', chu: 'Đã khôi phục đầu mối.' });
        return true;
      } catch {
        datBao({ loai: 'loi', chu: 'Không khôi phục được đầu mối.' });
        return false;
      }
    },
  };
}
