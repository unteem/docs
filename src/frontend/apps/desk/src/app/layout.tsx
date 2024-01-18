'use client';

import { CunninghamProvider } from '@openfun/cunningham-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './globals.css';
import { useCunninghamTheme } from '@/cunningham';

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useCunninghamTheme();

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools />
          <CunninghamProvider theme={theme}>{children}</CunninghamProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
