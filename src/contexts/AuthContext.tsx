import { ReactNode, createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decodeJwt, JWTPayload } from "jose";
import {
  CharacterPortraits,
  CharacterProfile,
  character,
  portrait,
} from "../utils/api";

const MIN_WAIT_MS = 700;

export interface UserIdentity {
  id?: number;
  name?: string;
  portrait?: string;
}

export interface AuthedContext {
  loading: boolean;
  token?: string;
  profile?: CharacterProfile;
  identity?: UserIdentity;
  reloadAuthState: () => void;
  updateToken: (token: string) => void;
  logout: () => void;
}

interface AuthContextProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthedContext>({
  loading: true,
  reloadAuthState: () => {},
  updateToken: () => {},
  logout: () => {},
});

export function AuthContextProvider({ children }: AuthContextProps) {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [identity, setIdentity] = useState<UserIdentity | undefined>(undefined);
  const [profile, setProfile] = useState<CharacterProfile | undefined>(
    undefined,
  );

  // Token-Cookie Sync
  useEffect(() => {
    const cookieToken = Cookies.get("token");

    // Token is not defined yet, but is in cache and exp is not too late
    if (loading && cookieToken && !token) {
      try {
        const res = decodeJwt(cookieToken) as JWTPayload;
        if (res && (res.exp ?? 0) >= Date.now() / 1000) {
          console.log("Setting token");
          setToken(cookieToken);
          setLoading(true);
          return;
        } else {
          console.log("Removing cookie, expired");
          Cookies.remove("token");
        }
      } catch (e) {
        console.warn("Failure while syncing token and cookies", e);
        Cookies.remove("token");
      }
      // A load attempted, and no token, make sure no cookie
    } else if (!loading && !token && cookieToken) {
      console.log("Clearing Cookie");
      Cookies.remove("token");
    } else if (!loading && token && !cookieToken) {
      console.log("Updated token");

      Cookies.set("token", token, {
        sameSite: "strict",
      });
    } else if (loading) {
      console.log("No cookie ops needed");
      setTimeout(() => setLoading(false), MIN_WAIT_MS);
    }
  }, [token, loading]);

  useEffect(() => {
    if (loading && token && !profile && identity?.id) {
      console.log("Getting profile claims");
      const run = async () => {
        const now = Date.now();
        const { data, error } = await character(token, identity.id!);
        if (error) {
          // TODO, better error handling
          console.error(error);
        }

        const diff = Date.now() - now;
        const minWait = MIN_WAIT_MS - diff;
        const wait = Math.max(0, minWait);

        setTimeout(() => {
          setProfile(data);
          setLoading(false);
        }, wait);
      };

      run();
    }
  }, [loading, profile, token, identity]);

  useEffect(() => {
    if (token && !identity) {
      const run = async () => {
        const decoded = decodeJwt(token);
        const id = Number(decoded.sub?.split(":")[2]);

        const { data, error } = await portrait(token, id);
        if (error) {
          // TODO, better error handling
          console.error(error);
        }

        const portraits = data as CharacterPortraits;

        setIdentity({
          id,
          name: decoded["name"] as string,
          portrait: portraits.px256x256,
        });
      };

      run();
    }
  }, [identity, setIdentity, token]);

  const context: AuthedContext = {
    token,
    identity,
    profile,
    loading,
    reloadAuthState: () => setLoading(true),
    updateToken: (token) => {
      setToken(token);
    },
    logout: () => {
      console.log("Logging out");
      setLoading(false);
      setToken(undefined);
    },
  };

  return (
    <AuthContext.Provider value={context}>{children}</AuthContext.Provider>
  );
}
