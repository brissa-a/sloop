import '@mantine/carousel/styles.css';
import '@mantine/code-highlight/styles.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import React from 'react';
import './App.css';
import { theme } from './MantineTheme';
import { routeTree } from './routeTree.gen';
import { SloopProvider } from './hooks/sloop';
import { trpcReact, useTrcpClient } from './misc/trpc';
import { JsonDisplayer } from './misc/jsonDisplay';
import { queryClient } from './misc/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export const App = () => {

  const trpcClient = useTrcpClient();

  return <React.StrictMode>
    <MantineProvider theme={theme}>
      <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <SloopProvider>
            <JsonDisplayer />
            <Notifications position='top-center' />
            <RouterProvider router={router} />
          </SloopProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </trpcReact.Provider>
    </MantineProvider>
  </React.StrictMode>

}
