'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: {
    displayName: string | null;
    email: string | null;
  } | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = sessionStorage.getItem('apexvest_user');
    if (username) {
      setUser({ displayName: username, email: `${username}@example.com` });
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
