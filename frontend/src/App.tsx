import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { RouterProvider } from 'react-router-dom';
import { useAuthBootstrap } from '@/features/auth/hooks/useAuthBootstrap';
import { router } from '@/routes/router';

const NO_RETRY_STATUSES = [400, 401, 403, 404, 409, 422];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (isAxiosError(error) && NO_RETRY_STATUSES.includes(error.response?.status ?? 0)) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export function App() {
  useAuthBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
