import { useLocalStorage } from '@mantine/hooks';
import type { AppRouter as TrpcRouter, AppWsRouter as TrpcWsRouter } from '@sloop-express/trpc'; //Type only import, Please avoid importing runtime code
import { createTRPCClient, createTRPCReact, createWSClient, httpBatchLink, wsLink } from '@trpc/react-query';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { useSloopFetch } from './fetch';

export type TrpcOut = inferRouterOutputs<TrpcRouter>;
export type TrpcIn = inferRouterInputs<TrpcRouter>;

export const trpcReact = createTRPCReact<TrpcRouter>();

const hostnameToApiUrl: Record<string, { http: string, ws: string }> = {
    "localhost": {
        "http": "http://localhost:3000",
        "ws": "ws://localhost:3000",
    },
    "sloopol2h4rnr-sloop-vite-dev.functions.fnc.fr-par.scw.cloud": {
        http: "https://sloopol2h4rnr-sloop-express-dev.functions.fnc.fr-par.scw.cloud",
        ws: "wss://sloopol2h4rnr-sloop-express-dev.functions.fnc.fr-par.scw.cloud",
    }
}

const apiUrl = hostnameToApiUrl[window.location.hostname]!;

export const trpcWs = createTRPCClient<TrpcWsRouter>({
    links: [
        wsLink({
            client: createWSClient({
                url: apiUrl.ws,
            }),
            transformer: superjson,
        }),
    ],
});


//TrcpClient => useQuery => trpc
export function useTrcpClient() {
    const sloopFetch = useSloopFetch();
    const [jwt,] = useLocalStorage<string | null>({ key: 'jwt', defaultValue: null });
    const trpcClient = trpcReact.createClient({
        links: [
            httpBatchLink({
                transformer: superjson,
                url: apiUrl.http + '/trpc',
                fetch: sloopFetch,
                async headers() {
                    return {
                        authorization: 'Bearer ' + (jwt || ""),
                    };
                },
            }),
        ],
    });

    return trpcClient;
}

