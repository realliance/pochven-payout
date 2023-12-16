import { ReactNode, createContext, useEffect, useState } from "react";
import { useCookies } from 'react-cookie';
import { decodeJwt, JWTPayload } from 'jose'

export interface AuthedContext {
    loading: boolean;
    token?: string;
    reloadAuthState: () => void;
    updateToken: (token: string) => void;
}

interface AuthContextProps {
    children: ReactNode;
}

export const AuthContext = createContext<AuthedContext>({
    loading: true,
    reloadAuthState: () => {},
    updateToken: () => {},
});

export function AuthContextProvider({ children }: AuthContextProps) {
    const [token, setToken] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [cookies, setCookie, removeCookie] = useCookies(['token']);

    // Token-Cookie Sync
    useEffect(() => {
        // Token is not defined yet, but is in cache and exp is not too late
        if (cookies.token && !token) {
            try {
                const res = decodeJwt(cookies.token) as JWTPayload;
                if (res && (res.exp ?? 0) >= Date.now() / 1000) {
                    console.log("Setting token")
                    setToken(cookies.token);
                    setLoading(true);
                    return;
                } else {
                    console.log("Removing cookie, expired");
                    removeCookie("token");
                }
            } catch (e) {
                console.warn('Failure while syncing token and cookies', e);
                removeCookie("token");
            }
        // A load attempted, and no token, make sure no cookie
        } else if (!loading && !token && cookies.token) {
            console.log("Clearing Cookie")
            removeCookie("token");
        
        } else if (!loading && token && !cookies.token) {
            console.log("Updated token");
            setCookie("token", token, {
                sameSite: "strict"
            });
        }
    }, [cookies, removeCookie, setCookie, setLoading, token]);

    const context: AuthedContext = {
        token,
        loading,
        reloadAuthState: () => setLoading(true),
        updateToken: (token) => {
            setToken(token);
        }
    }

    return (
        <AuthContext.Provider value={context}>
            {children}
        </AuthContext.Provider>
    )
}