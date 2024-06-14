import { useLocalStorage } from "@mantine/hooks";

type FetchUrl = Parameters<typeof fetch>[0]
type FetchOptions = Parameters<typeof fetch>[1]

type FetchMiddleware = (
    url: FetchUrl,
    options: FetchOptions,
    next: (url: FetchUrl, options: FetchOptions) => Promise<Response>,
) => Promise<Response>;

type Next = (
    currentIndex: number,
    url: FetchUrl,
    options: FetchOptions,
) => Promise<Response>;

// The original fetch function or a wrapper that eventually calls the native fetch
const baseFetch: FetchMiddleware = (url, options) => fetch(url, options);

// A function to execute the middleware chain
function applyFetchMiddleware(middlewares: FetchMiddleware[]): FetchAlike {
    // Return a new function that takes the url and options
    return function (url, options) {
        let index = -1; // Keep track of middleware execution

        // The function to execute the next middleware
        const next: Next = (currentIndex, url, options) => {
            // Prevent a middleware from being called multiple times
            if (currentIndex <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }

            index = currentIndex;
            let fn = middlewares[index];
            if (index === middlewares.length) {
                fn = baseFetch; // If it's the last middleware, call the baseFetch
            }
            if (!fn) throw new Error('Middleware not found');
            // Call the next middleware with next
            return Promise.resolve(fn(url, options, next.bind(null, index + 1)));
        };

        // Start the middleware chain
        return next(0, url, options);
    };
}

// const logMiddleware: FetchMiddleware = async (url, options, next) => {
//     console.log(`Requesting URL: ${url}`);
//     const resp = await next(url, options);
//     console.log(`Response status: ${resp.status}`);
//     return resp;
// };

const authMiddleware: (setJwt: (val: string) => unknown) => FetchMiddleware
    = (setJwt: (val: string) => unknown) => async (url, options, next) => {
        const token = localStorage.getItem('token');
        //parse jwt token and check if it is expired
        if (token) {
            if (!options) {
                options = { headers: {} };
            }
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        const resp = await next(url, options);
        const clearedOrNewToken = resp.headers.get('Set-Authorization-Bearer');
        if (clearedOrNewToken || clearedOrNewToken === '') {
            console.log('Set-Authorization-Bearer header found')
            setJwt(clearedOrNewToken);
        }
        return resp;
    }

type FetchAlike = ((
    url: FetchUrl,
    options: FetchOptions,
) => Promise<Response>);

export const useSloopFetch = () => {
    const [, setJwt] = useLocalStorage<string | null>({ key: 'jwt', defaultValue: null })
    const fetchWithMiddleware = applyFetchMiddleware([authMiddleware(setJwt)])

    return fetchWithMiddleware
}

