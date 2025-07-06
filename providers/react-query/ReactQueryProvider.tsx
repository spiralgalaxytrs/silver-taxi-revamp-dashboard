'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface Props {
  children: ReactNode;
}

const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE;

export default function ReactQueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {APP_MODE === 'development' &&
        <ReactQueryDevtools initialIsOpen={false} />
      }
    </QueryClientProvider>
  );
}
