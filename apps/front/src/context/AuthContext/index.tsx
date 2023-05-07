import { useHash } from '@mantine/hooks';
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { config } from '../../config';
import { Api } from '../../api';
import { UserDto, UserRepresentation } from '@streamtechroyale/models';

export interface AuthState {
    auth: {
        token: string,
        user: UserDto,
        representation?: UserRepresentation | undefined
    } | null,
    authenticate: () => void,
    logOut: () => void,
}

export const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = 'AUTH';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState['auth']>(null);
    const [hash, setHash] = useHash();

    const authenticate = useCallback(() => {
        window.location.href = config.authUrl;
    }, []);

    const logOut = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuth(null);
        setHash('');
    }, []);

    useEffect(() => {
        (async () => {
            const params = hash.replace('#', '');
            if (params.length) return;
            try {
                const tokenFromStorage = localStorage.getItem(STORAGE_KEY);
                if (!tokenFromStorage) return;
                const data = JSON.parse(tokenFromStorage) as AuthState['auth'];
                if (!data) return;
                const validationResult = await Api.validateToken(data.token);
                if (validationResult.error) {
                    localStorage.removeItem(STORAGE_KEY);
                    authenticate();
                    return;
                }

                const representationResult = await Api.getUserRepresentation(data.token);
                setAuth({
                    ...data,
                    representation: representationResult.data
                });
            } catch {
                return;
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const keyValues = hash.replace('#', '').split('&');

                for (const hashValue of keyValues) {
                    const [key, value] = hashValue.split('=');
                    if (key !== 'access_token' || !value) continue;
                    const authResult = await Api.apiAuthentication(value);
                    if (!authResult.data) continue;
                    const representationResult = await Api.getUserRepresentation(authResult.data.token);
                    const newAuth = {
                        ...authResult.data,
                        representation: representationResult.data
                    };
                    setAuth(newAuth);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAuth));
                    setHash('');
                }
            } catch {
                return;
            }
        })();
    }, [hash]);

    return (
        <AuthContext.Provider value={{ auth, authenticate, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};