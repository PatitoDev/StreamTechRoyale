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


// access_token=0n7n814qrdpwz9du2seggi2zy7ooix&scope=&token_type=bearer
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState['auth']>(null);
    const [hash, setHash] = useHash();

    const authenticate = useCallback(() => {
        window.location.href = config.authUrl;
    }, []);

    const logOut = useCallback(() => {
        setAuth(null);
        setHash('');
    }, []);

    useEffect(() => {
        (async () => {
            const keyValues = hash.replace('#', '').split('&');

            for (const hashValue of keyValues) {
                const [key, value] = hashValue.split('=');
                if (key === 'access_token' && value) {
                    const authResult = await Api.validateToken(value);
                    if (authResult.data) {
                        const representationResult = await Api.getUserRepresentation(authResult.data.token);
                        if (representationResult.data){
                            setAuth({
                                ...authResult.data,
                                representation: representationResult.data
                            });
                            setHash('');
                        }
                    }
                    // TODO - throw error
                }
            }
        })();
    }, [hash]);

    return (
        <AuthContext.Provider value={{ auth, authenticate, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};