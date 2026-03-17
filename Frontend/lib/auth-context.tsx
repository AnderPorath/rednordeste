"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

const STORAGE_KEY = "red-nordeste-auth";

export type UserType = "user" | "company" | "admin" | null;

export interface AdminInfo {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  description?: string;
  avatar?: string;
  cvUrl?: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  email: string;
  location: string;
  description?: string;
  logo?: string;
}

interface AuthState {
  isLoggedIn: boolean;
  userType: UserType;
  token: string | null;
  admin: AdminInfo | null;
  user: UserInfo | null;
  company: CompanyInfo | null;
}

interface AuthContextValue extends AuthState {
  login: (userType: "user" | "company", profile?: UserInfo | CompanyInfo, token?: string) => void;
  loginAdmin: (token: string, admin: AdminInfo) => void;
  updateUser: (partial: Partial<UserInfo>) => void;
  updateCompany: (partial: Partial<CompanyInfo>) => void;
  updateAdmin: (admin: Partial<AdminInfo>) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, userType: null, token: null, admin: null, user: null, company: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isLoggedIn: false, userType: null, token: null, admin: null, user: null, company: null };
    const parsed = JSON.parse(raw) as {
      userType?: UserType;
      token?: string;
      admin?: AdminInfo;
      user?: UserInfo;
      company?: CompanyInfo;
    };
    const userType = parsed.userType ?? null;
    if (userType === "admin") {
      const token = parsed.token ?? "";
      const admin = parsed.admin ?? null;
      if (!token || !admin) return { isLoggedIn: false, userType: null, token: null, admin: null, user: null, company: null };
      return { isLoggedIn: true, userType: "admin", token, admin, user: null, company: null };
    }
    if (userType === "user") {
      return {
        isLoggedIn: true,
        userType: "user",
        token: parsed.token ?? null,
        admin: null,
        user: parsed.user ?? null,
        company: null,
      };
    }
    if (userType === "company") {
      return {
        isLoggedIn: true,
        userType: "company",
        token: parsed.token ?? null,
        admin: null,
        user: null,
        company: parsed.company ?? null,
      };
    }
    return { isLoggedIn: false, userType: null, token: null, admin: null, user: null, company: null };
  } catch {
    return { isLoggedIn: false, userType: null, token: null, admin: null, user: null, company: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    userType: null,
    token: null,
    admin: null,
    user: null,
    company: null,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setState(getStoredAuth());
    setIsReady(true);
  }, []);

  const login = useCallback((userType: "user" | "company", profile?: UserInfo | CompanyInfo, token?: string) => {
    const payload: Record<string, unknown> = { userType };
    if (userType === "user") {
      if (profile) payload.user = profile;
      if (token) payload.token = token;
    }
    if (userType === "company") {
      if (profile) payload.company = profile;
      if (token) payload.token = token;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setState({
      isLoggedIn: true,
      userType,
      token: token ?? null,
      admin: null,
      user: userType === "user" ? (profile as UserInfo) ?? null : null,
      company: userType === "company" ? (profile as CompanyInfo) ?? null : null,
    });
  }, []);

  const loginAdmin = useCallback((token: string, admin: AdminInfo) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ userType: "admin", token, admin })
    );
    setState({
      isLoggedIn: true,
      userType: "admin",
      token,
      admin,
    });
  }, []);

  const updateAdmin = useCallback((partial: Partial<AdminInfo>) => {
    setState((prev) => {
      if (prev.userType !== "admin" || !prev.admin) return prev;
      const admin = { ...prev.admin, ...partial };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.userType === "admin") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, admin }));
          }
        }
      } catch {}
      return { ...prev, admin };
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isLoggedIn: false,
      userType: null,
      token: null,
      admin: null,
      user: null,
      company: null,
    });
  }, []);

  const updateUser = useCallback((partial: Partial<UserInfo>) => {
    setState((prev) => {
      if (prev.userType !== "user" || !prev.user) return prev;
      const user = { ...prev.user, ...partial };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.userType === "user") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, user }));
          }
        }
      } catch {}
      return { ...prev, user };
    });
  }, []);

  const updateCompany = useCallback((partial: Partial<CompanyInfo>) => {
    setState((prev) => {
      if (prev.userType !== "company" || !prev.company) return prev;
      const company = { ...prev.company, ...partial };
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.userType === "company") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, company }));
          }
        }
      } catch {}
      return { ...prev, company };
    });
  }, []);

  const getAuthHeaders = useCallback(() => {
    if (state.token && (state.userType === "admin" || state.userType === "user" || state.userType === "company")) {
      return { Authorization: `Bearer ${state.token}` };
    }
    return {};
  }, [state.userType, state.token]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginAdmin,
        updateUser,
        updateCompany,
        updateAdmin,
        logout,
        getAuthHeaders,
        isReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
