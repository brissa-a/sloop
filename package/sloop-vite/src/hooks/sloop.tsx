import { useLocalStorage } from '@mantine/hooks';
import { SloopJwtPayloadSchema, UserJwtPayload } from '@sloop-common/jwt';
import { TrpcIn, trpcReact } from '@sloop-vite/misc/trpc';
import { nanoid } from 'nanoid';
import React, { PropsWithChildren, createContext, useEffect } from 'react';

interface SloopContextProps {
    user: UserJwtPayload | null;
    principal: UserJwtPayload | null;
    isAdmin: boolean;
    logout: () => void;
    login: (input: TrpcIn['user']['login']) => void;
    appInstanceId: string;
}

const SloopContext = createContext<SloopContextProps>({
    user: null,
    principal: null,
    isAdmin: false,
    logout: () => { },
    login: () => { },
    appInstanceId: '',
    //TODO deviceID:
});


export const SloopProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [jwt, setJwt] = useLocalStorage<string | null>({ key: 'jwt', defaultValue: null });
    const [appInstanceId,] = useLocalStorage<string>({ key: 'appInstanceId', defaultValue: nanoid() });
    const parsedJwt = jwt ? SloopJwtPayloadSchema.safeParse(parseJwt(jwt)) : { success: false, error: { errors: ['Jwt not present'] } } as const;
    useEffect(() => {
        if (jwt !== null && !parsedJwt.success) {
            parsedJwt.error.errors.forEach(e => console.error(e));
            setJwt(null);
            return
        }
    }, [])
    const { user, principal, isAdmin } = parsedJwt.success ? parsedJwt.data : { user: null, principal: null, isAdmin: false };
    const login = trpcReact.user.login.useMutation().mutate
    const logout = trpcReact.user.logout.useMutation({
        onError: () => setJwt(null) //Set JWT to null whatever the result of the mutation
    }).mutate


    return (
        <SloopContext.Provider value={{ user, principal, isAdmin, login, logout, appInstanceId }}>
            {children}
        </SloopContext.Provider>
    );
};

function parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    if (!base64Url) throw new Error('Invalid JWT token');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export const useSloop = () => React.useContext(SloopContext);

export const useUser = () => {
    const { user } = useSloop();
    return user;
}
