import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authService } from "../Services/authService";

type AuthContextValue = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  checkAuth: () => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(() => authService.isAuthenticated());

  const checkAuth = useCallback(() => {
    const value = authService.isAuthenticated();
    setAuthenticated(value);
    return value;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      setAuthenticated,
      checkAuth,
    }),
    [isAuthenticated, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
