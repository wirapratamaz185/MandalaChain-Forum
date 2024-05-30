// hooks/useAuth.tsx:
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { AuthContextType, User } from '@/utils/interface/auth';

export const AuthContext = createContext<AuthContextType>({
  user: null, setUser: () => { },
  id: undefined
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCookie = getCookie('access_token');
    if (userCookie) {
      setUser(JSON.parse(userCookie as string));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ id: undefined, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);