import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import type { User } from '../../types/user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = () => {
    // simple redirect flow
    window.location.href = '/api/auth/google?force_consent=1';
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
